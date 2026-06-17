import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

function parseCsv(value) {
    return (value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

function resolvePort() {
    if (process.env.PORT) {
        return process.env.PORT;
    }

    return process.env.RENDER ? '10000' : '3000';
}

function resolveDatabaseSsl() {
    const value = process.env.DATABASE_SSL?.toLowerCase();

    if (!value) {
        return isProduction ? 'require' : false;
    }

    if (['true', '1', 'require'].includes(value)) {
        return 'require';
    }

    if (['false', '0', 'disable', 'disabled'].includes(value)) {
        return false;
    }

    if (['allow', 'prefer', 'verify-full'].includes(value)) {
        return value;
    }

    throw new Error('DATABASE_SSL must be one of: true, false, require, disable, allow, prefer, verify-full');
}

const clientOrigins = parseCsv(process.env.CLIENT_ORIGIN);

if (!clientOrigins.length && !isProduction) {
    clientOrigins.push('http://localhost:5173');
}

if (isProduction && !clientOrigins.length) {
    throw new Error('CLIENT_ORIGIN is required in production');
}

const sessionSecret = requireEnv('SESSION_SECRET');

if (isProduction && sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters in production');
}

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: resolvePort(),
    DATABASE_URL: requireEnv('DATABASE_URL'),
    DATABASE_SSL: resolveDatabaseSsl(),
    CLIENT_ORIGINS: clientOrigins,
    SESSION_SECRET: sessionSecret,
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || 'splitapp.sid',
    isProduction
};
