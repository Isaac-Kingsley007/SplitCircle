import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import pgSession from 'connect-pg-simple';

import { env } from './config/env.js';
import { sessionCookieName, sessionCookieOptions } from './config/session.js';
import authMiddleware from './middleware/auth.js';

import sql from './db/db.js';

import authRoutes from './routes/auth.js';
import splitRoutes from './routes/splits.js';

const app = express();
const PORT = env.PORT;
const PostgresStore = pgSession(session);

if (env.isProduction) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.CLIENT_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error('Not allowed by CORS');
    error.status = 403;
    return callback(error);
  },
  credentials: true
}));

app.use('/api/',rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, 
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
}));

app.use(compression());

app.use(morgan(env.isProduction ? 'combined' : 'dev'));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({extended: true}));

app.use(session({
  name: sessionCookieName,
  store: new PostgresStore({
    query: async (queryText, values) => {
      return await sql.unsafe(queryText, values);
    },
    tableName: 'session'
  }),
  secret: env.SESSION_SECRET,
  resave: false,                 
  saveUninitialized: false,      
  cookie: sessionCookieOptions
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend JS server is running smoothly!' });
});
app.use('/api/auth', authRoutes);

app.use(authMiddleware);

app.use('/api/splits', splitRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error('Error:', err);
  const statusCode = err.status || err.statusCode || 500;
  const message = env.isProduction && statusCode === 500 ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Express server is listening on port ${PORT}`);
});
