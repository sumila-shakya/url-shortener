# URL Shortener

A production-grade URL shortening service built with Node.js, TypeScript, and Express. Features real-time analytics, browser tracking, privacy-preserving IP hashing, Redis-backed rate limiting, response caching, and background job processing with BullMQ.

## ✨ Features

- 🔗 **URL Shortening** - Convert long URLs into short, shareable links
- 🏷️ **Custom Slugs** - Choose a memorable slug instead of a random code
- 📊 **Analytics Dashboard** - Track clicks, unique visitors, and browser distribution
- 🔒 **Privacy-First** - IP addresses hashed with SHA-256
- 🌐 **Browser Detection** - Automatic parsing of Chrome, Firefox, Safari, Edge
- ⚡ **Background Job Processing** - Analytics logging handled asynchronously via BullMQ, with automatic retries on failure
- 🚦 **Rate Limiting** - Redis-backed rate limiting (3 requests / 10 min) on URL creation to prevent abuse
- 🏎️ **Response Caching** - Redirect lookups cached to reduce database load and speed up repeat redirects
- 🧱 **Structured Responses** - Consistent success/error response format across all endpoints
- 🛡️ **Centralized Error Handling** - Global error handler with standardized error codes and messages

## 🛠️ Tech Stack

**Backend:**
- Node.js 20+
- TypeScript
- Express.js

**Databases & Storage:**
- MySQL 8.0 (URL storage, click counter)
- MongoDB 8.0+ (Analytics events)
- Redis (Rate limiting, caching, BullMQ job queue)

**Libraries:**
- Drizzle ORM (MySQL)
- Mongoose (MongoDB)
- ioredis (Redis client)
- BullMQ (Background job queue & processing)
- Zod (Validation)

## 📋 Prerequisites

Before running this project, ensure you have:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [MySQL](https://dev.mysql.com/downloads/) (v8.0 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v8.0 or higher)
- [Redis](https://redis.io/download/) (v6.0 or higher)
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/sumila-shakya/url-shortener.git
cd url-shortener
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE url_shortener;
exit;
```

### 4. Setup MongoDB

MongoDB should be running on default port 27017.
```bash
# Start MongoDB (if not running)
sudo systemctl start mongod.service

# Or on macOS
brew services start mongodb-community
```

### 5. Setup Redis

Redis should be running on default port 6379.
```bash
# Start Redis (Linux)
sudo systemctl start redis

# Or on macOS
brew services start redis

# Or via Docker
docker run -d -p 6379:6379 redis
```

**Verify Redis is running:**
```bash
redis-cli ping
# Should respond: PONG
```

### 6. Configure Environment Variables

Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server
PORT=3000
BASE_URL=http://localhost:3000

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=url_shortener

# MongoDB
MONGODB_URL=mongodb://localhost:27017/url_shortener

# Redis
REDIS_URL=redis://localhost:6379
```

### 7. Run Database Migrations
```bash
cd server
npm run db:generate
npm run db:push
```

This creates the `urls` table in MySQL with proper indexes.

### 8. Start the Development Server
```bash
npm run dev
```

Server will start at `http://localhost:3000`. This starts both the API server and the BullMQ worker (analytics jobs are processed in the same process).

## 📚 API Documentation

### Response Format

All API responses follow a consistent structure.

**Success Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Success",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid format",
  "errors": [ ... ]
}
```

Errors are caught by a global error-handling middleware, ensuring every failure — validation errors, database errors, rate limit rejections, or unexpected exceptions — returns this same shape with an appropriate HTTP status code.

---

### Create Short URL

**Endpoint:** `POST /api/urls`

**Rate Limit:** 3 requests per 10 minutes per IP address

**Request Body:**
```json
{
  "longUrl": "https://example.com/very/long/url",
  "slug": "myurl"
}
```
`slug` is optional — a random short code is generated if omitted.

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Url shortened successfully",
  "data": {
    "id": 6,
    "shortUrl": "http://localhost:3000/dbshwMN",
    "longUrl": "https://medium.com/@erickzanetti/redis-and-node-js-with-typescript-a-complete-guide-2bac6e300497",
    "createdAt": "2026-08-20T08:35:12.000Z",
    "clicks": 0
  }
}
```

**Rate Limit Exceeded (429 Too Many Requests):**
```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests. Please try again later!!",
  "errors": []
}
```

---

### Redirect to Long URL

**Endpoint:** `GET /:shortCode`

**Example:** `GET /FbcFKTn`

**Response:**
- `302` redirect to long URL
- Increments click counter
- Logs analytics asynchronously via a BullMQ background job (does not block the redirect)

**Caching:** The short code → long URL lookup is cached in Redis, so repeat redirects for the same short code skip the database and respond faster.

---

### Get Analytics

**Endpoint:** `GET /api/urls/:shortCode/stats`

**Example:** `GET /api/urls/FbcFKTn/stats`

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "shortCode": "jUKzXnB",
    "originalUrl": "https://medium.com/@erickzanetti/redis-and-node-js-with-typescript-a-complete-guide-2bac6e300497",
    "analytics": {
      "totalClickCount": 21,
      "uniqueUsers": 1,
      "clicksByDay": [
        {
          "date": "2026-08-20",
          "clicks": 4
        },
        {
          "date": "2026-08-18",
          "clicks": 7
        },
        {
          "date": "2026-08-11",
          "clicks": 10
        }
      ],
      "browserDistribution": [
        {
          "browser": "Chrome",
          "clicks": 4
        },
        {
          "browser": "other",
          "clicks": 17
        }
      ]
    }
  }
}
```

**URL Not Found (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Url not Found",
  "errors": []
}
```

---

## ⚙️ Background Job Processing (BullMQ)

Click analytics are logged asynchronously through a Redis-backed job queue rather than blocking the redirect response:
```
Redirect request → lookup URL (cached) → increment click counter → 302 redirect
↓
(job queued, processed independently)
↓
MongoDB analytics write + IP hash + browser parse
```

**Why:** This decouples the redirect's response time from analytics logging, and provides automatic retries if the MongoDB write temporarily fails — instead of silently losing the click event.

**Configuration:**
- Failed jobs retry up to 3 times with exponential backoff
- Jobs are processed in the same Node.js process as the API server (single-instance setup)

---

## 🗂️ Project Structure
```
url_shortener/
├── server/
│ ├── drizzle/ # Database migrations
│ ├── src/
│ │ ├── @types/
│ │ │ └── interface.ts
│ │ ├── config/ # Database & Redis connections
│ │ │ ├── mysql.config.ts
│ │ │ ├── env.config.ts
│ │ │ ├── mongodb.config.ts
│ │ │ └── redis.config.ts
│ │ ├── controllers/ # Request handlers
│ │ │ └── url.controller.ts
│ │ ├── services/ # Business logic
│ │ │ ├── url.service.ts
│ │ │ └── logger.service.ts
│ │ ├── db/ # Database schemas
│ │ │ ├── mysql.model.ts
│ │ │ └── mongodb.model.ts
│ │ ├── routes/ # API routes
│ │ │ └── url.route.ts
│ │ ├── middleware/ # Express middleware
│ │ │ ├── error.middleware.ts
│ │ │ ├── rateLimiter.middleware.ts
│ │ │ └── cache.middleware.ts
│ │ ├── queues/ # BullMQ queue definitions
│ │ │ ├── queue.ts
│ │ │ └── worker.ts
│ │ ├── utils/ # Helper functions
│ │ │ ├── shortcode.ts
│ │ │ ├── constants.ts
│ │ │ ├── hashIp.ts
│ │ │ ├── userAgentParser.ts
│ │ │ ├── apiResponse.ts
│ │ │ ├── apiError.ts
│ │ │ └── validator.ts
│ │ ├── app.ts
│ │ └── server.ts # Application entry point
│ ├── .env.example # Environment template
│ ├── package.json
│ ├── package-lock.json
│ ├── tsconfig.json
│ └── drizzle.config.js
├── .gitignore
└── README.md
```

## 📊 Database Schema

### MySQL - urls table
```sql
CREATE TABLE urls (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  long_url VARCHAR(2048) NOT NULL,
  clicks INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX urls_short_code_unique (short_code)
);
```

### MongoDB - analytics collection
```javascript
{
  _id: ObjectId,
  short_code: String,
  timestamp: Date,
  ip_address: String,  // SHA-256 hashed
  user_agent: String,
  browser: String
}

// Indexes:
// - { browser: 1 }
// - { short_code: 1, timestamp: -1 }
```

### Redis - key usage

| Prefix | Purpose |
|--------|---------|
| `ip:*` | Rate limiting counters for URL creation |
| `{shortCode}:*` | Cached short code → long URL lookups |
| `log-click:*` | BullMQ job queue for analytics logging |

## 🔧 Available Scripts
```bash
# Development
npm run dev          # Start API server + worker with nodemon (hot reload)

# Production
npm run build        # Compile TypeScript
npm start            # Run compiled code

# Database
npm run db:generate  # Generate migration files
npm run db:push      # Apply migrations to database
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| PORT | Server port | 3000 | No |
| BASE_URL | Base URL for short links | http://localhost:3000 | Yes |
| DB_HOST | MySQL host | localhost | Yes |
| DB_USER | MySQL username | root | Yes |
| DB_PASSWORD | MySQL password | - | Yes |
| DB_NAME | MySQL database name | url_shortener | Yes |
| MONGODB_URL | MongoDB connection string | mongodb://localhost:27017/url_shortener | Yes |
| REDIS_URL | Redis connection string | redis://localhost:6379 | Yes |

## 🚨 Troubleshooting

### MySQL Connection Error

**Error:** `ER_ACCESS_DENIED_ERROR`

**Solution:** Check MySQL credentials in `.env` file
```bash
mysql -u root -p
# Test if you can login with the password in .env
```

---

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:** Start MongoDB service
```bash
# Linux
sudo systemctl start mongod.service

# macOS
brew services start mongodb-community
```

---

### Redis Connection Error

**Error:** `ECONNREFUSED 127.0.0.1:6379`

**Solution:** Start Redis service
```bash
# Linux
sudo systemctl start redis

# macOS
brew services start redis

# Verify
redis-cli ping
```

---

### Request Body Undefined

**Error:** Validation errors saying "expected object, received undefined"

**Solution:** Ensure `express.json()` middleware is added before routes
```typescript
app.use(express.json());
app.use('/api', routes);
```

## 🔐 Security Features

- **IP Hashing:** SHA-256 hashing prevents PII storage
- **Input Validation:** Zod schemas prevent malicious input
- **Parameterized Queries:** Drizzle ORM prevents SQL injection
- **URL Validation:** Blocks javascript:, data:, file: schemes
- **Rate Limiting:** Redis-backed rate limiting prevents URL creation abuse (3 requests / 10 min per IP)

## 👤 Author

**Sumila Shakya**
- Student ID: 80010269
- Course: BSc CSIT (5th Semester)
- Institution: Amrit Science College
- GitHub: [@sumila-shakya](https://github.com/sumila-shakya)

## 📝 License

This project is created for academic purposes as part of the Web Technology II, System Analysis & Design, and Design & Analysis of Algorithms courses.

## 🙏 Acknowledgments

- Node.js and Express.js communities
- Drizzle ORM documentation
- MongoDB documentation
- BullMQ documentation
- Course instructors and mentors

---