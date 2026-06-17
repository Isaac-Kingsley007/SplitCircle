import { env } from './env.js';

const oneDay = 1000 * 60 * 60 * 24;

export const sessionCookieName = env.SESSION_COOKIE_NAME;

export const sessionCookieOptions = {
    secure: env.isProduction,
    httpOnly: true,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: oneDay
};

export const clearSessionCookieOptions = {
    secure: sessionCookieOptions.secure,
    httpOnly: sessionCookieOptions.httpOnly,
    sameSite: sessionCookieOptions.sameSite,
    path: '/'
};
