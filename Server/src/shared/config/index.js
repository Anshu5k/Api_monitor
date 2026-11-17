import dotenv from 'dotenv';
dotenv.config();
const config={
    node_env:process.env.NODE_ENV ||'development',
    port:parseInt(process.env.PORT||'3000',10),

    mongo:{
        uri:process.env.MONGO_URI||'mongodb://localhost:27018',
        dbName:process.env.MONGO_DB_NAME||'api-monitoring',

    },
    postgres:{
        host:process.env.PG_HOST||'localhost',
        port:parseInt(process.env.PG_PORT||'5432',10),
        database:process.env.PG_DATABASE||'api_monitoring',
        user:process.env.PG_USER||'postgres',
        password:process.env.PG_PASSWORD||'mypassword',
    },
    rabbitmq:{
        url:process.env.RABBITMQ_URL||'amqp://guest:guest@localhost:5672/api_monitoring',
        queue:process.env.RABBITMQ_QUEUE||'api-hits',
        publisherConfirm:process.env.RABBITMQ_PUBLISHER_CONFIRM==='true'||false,
        retryAttempts:parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS||'5',10),
        retryDelay:parseInt(process.env.RABBITMQ_RETRY_DELAY||'5000',10),
    },
    jwt:{
        secret:process.env.JWT_SECRET||'123456789012345678901234567890123',
        expiresIn:process.env.JWT_EXPIRES_IN||'3d',
    },
    rateLimit:{
        windowsMs:parseInt(process.env.RATE_LIMIT_WINDOW_MS||'60000',10),
        maxRequests:parseInt(process.env.RATE_LIMIT_MAX_REQUESTS||'1000',10),
    },
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expiresIn: 24 * 60 * 60 * 1000
    }
}
export default config;