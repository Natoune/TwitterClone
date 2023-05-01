import 'dotenv/config';

// Global
export const APP_NAME = process.env.APP_NAME || 'AppName';
export const APP_DESCRIPTION = process.env.APP_DESCRIPTION || 'AppDescription';
export const MIN_AGE = parseInt(process.env.MIN_AGE) || 13;

// Backend
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
export const USERCONTENT_BASE_URL = process.env.USERCONTENT_BASE_URL || 'http://localhost:3000/usercontent';

// Secrets
export const RECAPTCHA_V3_KEY = process.env.RECAPTCHA_V3_KEY || '';
export const RECAPTCHA_V2_KEY = process.env.RECAPTCHA_V2_KEY || '';

// Resources
export const RESOURCES = {
    ICON: process.env.RESOURCES_ICON || '/icon.svg',
    LOGIN_BACKGROUNDS: [
        '/images/backgrounds/login_bg_1.jpg',
        '/images/backgrounds/login_bg_2.jpg',
        '/images/backgrounds/login_bg_3.jpg',
    ]
};

export const IS_APP = (process.env.IS_APP == 'true' ? true : false) || false;

// Functions
export const IS_MOBILE = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        return true;
    return false;
}
