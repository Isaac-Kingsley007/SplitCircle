import { env } from './env.js';

const oneDay = 1000 * 60 * 60 * 24;

export const sessionCookieName = env.SESSION_COOKIE_NAME;

export const sessionCookieOptions = {
    secure: env.SESSION_COOKIE_SECURE,
    httpOnly: true,
    sameSite: env.SESSION_COOKIE_SAME_SITE,
    maxAge: oneDay
};

export const clearSessionCookieOptions = {
    secure: sessionCookieOptions.secure,
    httpOnly: sessionCookieOptions.httpOnly,
    sameSite: sessionCookieOptions.sameSite,
    path: '/'
};
