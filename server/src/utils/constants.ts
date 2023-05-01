import 'dotenv/config';

export const {
    APP_NAME = process.env.APP_NAME || 'App',
    APP_URL = process.env.APP_URL || 'http://localhost:5173',
    PORT = process.env.PORT || 3000,
    LOCALE = process.env.LOCALE || 'en-US',
    MIN_AGE = process.env.MIN_AGE || '13',
    MONGODB_URI = process.env.MONGODB_URI || '',
    RECAPTCHA_V3_SECRET = process.env.RECAPTCHA_V3_SECRET || '',
    RECAPTCHA_V2_SECRET = process.env.RECAPTCHA_V2_SECRET || '',
    JWT_SECRET = process.env.JWT_SECRET,
    MAILER_HOST = process.env.MAILER_HOST || '',
    MAILER_PORT = process.env.MAILER_PORT || '587',
    MAILER_SECURE = process.env.MAILER_SECURE || 0,
    MAILER_USER = process.env.MAILER_USER || '',
    MAILER_PASS = process.env.MAILER_PASS || '',
    MAILER_FROM = process.env.MAILER_FROM || '',
    DKIM_PRIVATE_KEY = process.env.DKIM_PRIVATE_KEY || '',
} = process.env;
