declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string,
            CLIENT_URL: string,
            DB_HOST: string,
            DB_USER: string,
            DB_PASSWORD: string,
            DB_NAME: string,
            MONGODB_URL: string,
            BASE_URL: string,
            REDIS_URL: string
        }
    }
}

export {}