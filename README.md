# URL Shortener

A URL shortening service built with Node.js, TypeScript, and Express. Features real-time analytics, browser tracking, and privacy-preserving IP hashing.

## ✨ Features

- 🔗 **URL Shortening** - Convert long URLs into short, shareable links
- 📊 **Analytics Dashboard** - Track clicks, unique visitors, and browser distribution
- 🔒 **Privacy-First** - IP addresses hashed with SHA-256
- 🌐 **Browser Detection** - Automatic parsing of Chrome, Firefox, Safari, Edge
- ⚡ **High Performance** - Event-driven architecture
- 📱 **Custom Slug Feature** - Custom slug for readability

## 🛠️ Tech Stack

**Backend:**
- Node.js 20+
- TypeScript
- Express.js

**Databases:**
- MySQL 8.0 (URL storage, click counter)
- MongoDB 8.0+ (Analytics events)

**Libraries:**
- Drizzle ORM (MySQL)
- Mongoose (MongoDB)
- Zod (Validation)

## 📋 Prerequisites

Before running this project, ensure you have:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [MySQL](https://dev.mysql.com/downloads/) (v8.0 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v8.0 or higher)
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

### 5. Configure Environment Variables

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
MONGO_URI=mongodb://localhost:27017/url_shortener
```

### 6. Run Database Migrations
```bash
cd server
npm run db:generate
npm run db:push
```

This creates the `urls` table in MySQL with proper indexes.

### 7. Start the Development Server
```bash
npm run dev
```

Server will start at `http://localhost:3000`

## 📚 API Documentation

### Create Short URL

**Endpoint:** `POST /api/urls`

**Request Body:**
```json
{
  "longUrl": "https://example.com/very/long/url",
  "slug": "myurl",  // Optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shortUrl": "http://localhost:3000/FbcFKTn",
    "longUrl": "https://example.com/very/long/url",
    "createdAt": "2026-01-19T12:30:00Z",
    "clicks": 0
  }
}
```

---

### Redirect to Long URL

**Endpoint:** `GET /:shortCode`

**Example:** `GET /FbcFKTn`

**Response:** 
- 302 redirect to long URL
- Increments click counter
- Logs analytics asynchronously

---

### Get Analytics

**Endpoint:** `GET /api/urls/:shortCode/stats`

**Example:** `GET /api/urls/FbcFKTn/stats`

**Response (200 OK):**
```json
{
  "success": true,
  "report": {
    "shortCode": "FbcFKTn",
    "originalUrl": "https://example.com/very/long/url",
    "analytics": {
      "totalClickCount": 150,
      "uniqueUsers": 45,
      "clicksByDay": [
        { "date": "2026-01-17", "clicks": 50 },
        { "date": "2026-01-18", "clicks": 60 },
        { "date": "2026-01-19", "clicks": 40 }
      ],
      "browserDistribution": [
        { "browser": "Chrome", "clicks": 90 },
        { "browser": "Firefox", "clicks": 35 },
        { "browser": "Safari", "clicks": 25 }
      ]
    }
  }
}
```

---

## 🗂️ Project Structure
```
url_shortener/
├── server/
│    ├── drizzle/             # Database migrations
│    ├── src/
│    │   ├── config/           # Database connections
│    │   │   ├── mysql.ts
│    │   │   └── mongodb.ts
│    │   ├── controllers/      # Request handlers
│    │   │   └── urlController.ts
│    │   ├── services/         # Business logic
│    │   │   ├── urlServices.ts
│    │   │   └── loggerServices.ts
│    │   ├── db/              # Database schemas
│    │   │   ├── mysqlSchema.ts
│    │   │   └── mongodbSchema.ts
│    │   ├── routes/          # API routes
│    │   │   └── urlRoutes.ts
│    │   ├── utils/           # Helper functions
│    │   │   ├── shortcode.ts
│    │   │   ├── hashIp.ts
│    │   │   └── userAgentParser.ts
│    │   │   └── validator.ts
│    │   ├── events/          # Event emitters
│    │   │   └── analyticsEvents.ts
│    │   └── server.ts        # Application entry point
│    ├── .env.example         # Environment template
│    ├── package.json
│    ├── package-lock.json
│    ├── tsconfig.json
│    └── drizzle.config.js
├── .gitignore
└── README.md
```

## 🧪 Testing

### Manual Testing with CURL

**Create a short URL:**
```bash
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://github.com"}'
```

**Test redirect:**
```bash
curl -L http://localhost:3000/FbcFKTn
```

**Get analytics:**
```bash
curl http://localhost:3000/api/urls/FbcFKTn/stats
```

### Test Different Browsers
```bash
# Chrome
curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0" \
  -L http://localhost:3000/FbcFKTn

# Firefox
curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0" \
  -L http://localhost:3000/FbcFKTn
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

## 🔧 Available Scripts
```bash
# Development
npm run dev          # Start with nodemon (hot reload)

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

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** Kill process or change port
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>

# Or change PORT in .env
PORT=3001
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
- Course instructors and mentors

---