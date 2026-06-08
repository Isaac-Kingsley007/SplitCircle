import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import pgSession from 'connect-pg-simple';

import sql from './db/db.js';

import authRoutes from './routes/auth.js';
import splitRoutes from './routes/splits.js';

const app = express();
const PORT = process.env.PORT || 3000;
const PostgresStore = pgSession(session);

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use('/api/',rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
}));

app.use(compression());

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
  store: new PostgresStore({
    query: async (queryText, values) => {
      return await sql.unsafe(queryText, values);
    },
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET, 
  resave: false,                 
  saveUninitialized: false,      
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,              
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend JS server is running smoothly!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/splits', splitRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Express Server is running at http://localhost:${PORT}`);
});