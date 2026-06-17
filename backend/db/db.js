import postgres from 'postgres';
import { env } from '../config/env.js';

const sql = postgres(env.DATABASE_URL, {
    ssl: env.DATABASE_SSL
});

export default sql;