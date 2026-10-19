import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { generalRateLimiter } from './middleware/rateLimitMiddleware.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS Configuration with credentials
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, test runners)
      if (!origin) return callback(null, true);
      if (origin === clientUrl || origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') {
        return callback(null, true);
      }
      return callback(null, true); // Dev flexible fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body parsing with safe size limits
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// Request logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Apply general rate limiter on API endpoints
if (process.env.NODE_ENV !== 'test') {
  app.use('/api', generalRateLimiter);
}

// Mount API routes
app.use('/api', routes);

// 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
