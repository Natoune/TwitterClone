// Global
export const APP_NAME = 'Twitter Clone';
export const APP_DESCRIPTION = 'Un clone de twitter en Node.js (en cours de développement).';
export const MIN_AGE = 13;

// Backend
export const API_BASE_URL = 'http://localhost:3000/api';
export const USERCONTENT_BASE_URL = 'http://localhost:3000/usercontent';

// Keys
export const RECAPTCHA_V3_KEY = '6Lf5acYlAAAAAID-IDvf8NGdCkLMQLjvw_VpNtqZ';
export const RECAPTCHA_V2_KEY = '6Lf9hMYlAAAAAGoVo-4CiEFgu8ArQNRlzYfZ7fez';

// Resources
export const RESOURCES = {
    ICON: '/icon.svg',
    LOGIN_BACKGROUNDS: [
        '/images/backgrounds/login_bg_1.jpg',
        '/images/backgrounds/login_bg_2.jpg',
        '/images/backgrounds/login_bg_3.jpg',
    ]
};

export const IS_APP = false;

// Functions
export const IS_MOBILE = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        return true;
    return false;
}
