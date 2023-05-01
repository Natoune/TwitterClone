import { API_BASE_URL, MIN_AGE } from "./constants";
import axios from "axios";

export async function registerCheck(step: number, data: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let errors = [];

        if (step === 1) {
            let name = data.name.trim();
            let email = data.email.replaceAll(' ', '');

            if (name === undefined || name === null || name.length === 0) {
                errors.push({
                    message: 'Le nom est obligatoire',
                    input: 'name'
                });
            } else if (name.split(' ').length !== 2) {
                errors.push({
                    message: 'Entrez votre nom complet (prénom et nom)',
                    input: 'name'
                });
            } else if (name.split(' ')[0].length > 32 || name.split(' ')[1].length > 32) {
                errors.push({
                    message: 'Le nom est trop long',
                    input: 'name'
                });
            }

            if (email === undefined || email === null || email === "") {
                errors.push({
                    message: 'L\'adresse email est obligatoire',
                    input: 'email'
                });
            } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                errors.push({
                    message: 'Entrez une adresse email valide',
                    input: 'email'
                });
            } else if (email.length > 255) {
                errors.push({
                    message: 'L\'adresse email est trop longue',
                    input: 'email'
                });
            } else if (await emailExists(email)) {
                errors.push({
                    message: 'Cette adresse email est déjà utilisée',
                    input: 'email'
                });
            }

            if (errors.length > 0) {
                reject(errors);
            } else {
                resolve({});
            }
        } else if (step === 2) {
            let day = data.day;
            let month = data.month;
            let year = data.year;

            if (typeof day !== "number" || day < 1 || day > 31) {
                errors.push({
                    message: 'Entrez un jour valide',
                    input: 'day'
                });
            }

            if (typeof month !== "number" || month < 1 || month > 12) {
                errors.push({
                    message: 'Entrez un mois valide',
                    input: 'month'
                });
            }

            if (typeof year !== "number" || year < new Date().getFullYear() - 100 - MIN_AGE || year > new Date().getFullYear() - MIN_AGE) {
                errors.push({
                    message: 'Entrez une année valide',
                    input: 'year'
                });
            }

            if (errors.length > 0) {
                reject(errors);
            } else {
                resolve({});
            }
        } else if (step === 3) {
            let username = data.username.trim();
            let password = data.password;
            let passwordConfirmation = data.passwordConfirmation;

            if (username === undefined || username === null || username === "") {
                errors.push({
                    message: 'Le nom d\'utilisateur est obligatoire',
                    input: 'username'
                });
            } else if (username.length < 4 || username.length > 32) {
                errors.push({
                    message: 'Le nom d\'utilisateur doit faire entre 4 et 32 caractères',
                    input: 'username'
                });
            } else if (await usernameExists(username)) {
                errors.push({
                    message: 'Ce nom d\'utilisateur est déjà utilisé',
                    input: 'username'
                });
            } else if (!data.username.match(/^[a-zA-Z0-9\-_]+$/)) {
                errors.push({
                    message: 'Le nom d\'utilisateur ne peut contenir que des lettres, des chiffres, des tirets et des underscores',
                    input: 'username'
                });
            }

            if (password === undefined || password === null || password === "") {
                errors.push({
                    message: 'Le mot de passe est obligatoire',
                    input: 'password'
                });
            }

            if (password !== passwordConfirmation) {
                errors.push({
                    message: 'Les mots de passe ne correspondent pas',
                    input: 'passwordConfirmation'
                });
            }

            if (password.length < 8 || password.length > 255) {
                errors.push({
                    message: 'Le mot de passe doit faire entre 8 et 255 caractères',
                    input: 'password'
                });
            }

            if (errors.length > 0) {
                reject(errors);
            }

            resolve({});
        }
    });
}

export async function emailExists(email: string) {
    return await axios.post(`${API_BASE_URL}/user/exists/email`, {
        email
    }, {
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((response) => {
        if (response.status === 200)
            return response.data.exists;
        return false;
    }).catch(() => {
        return false;
    });
}

export async function usernameExists(username: string) {
    return await axios.post(`${API_BASE_URL}/user/exists/username`, {
        username
    }, {
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((response) => {
        if (response.status === 200)
            return response.data.exists;
        return false;
    }).catch(() => {
        return false;
    });
}

export async function fakeUsername(name: string) {
    let fake = name.replaceAll(' ', '').toLowerCase() + Math.floor(Math.random() * 1000);
    if (await usernameExists(fake))
        return fakeUsername(name);

    return fake;
}

export async function register(data: any) {
    return await axios.post(`${API_BASE_URL}/auth/register`, {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
        birth: {
            day: data.day,
            month: data.month,
            year: data.year
        },
        recaptcha: data.recaptcha
    }, {
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((response) => {
        if (response.status === 200) {
            if (!response.data.token)
                return 'ko';

            document.cookie = `token=${response.data.token}; path=/; expires=${new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30).toUTCString()}`;
            localStorage.setItem('token', response.data.token);

            return 'ok';
        } else {
            if (response.data && response.data.code)
                return response.data.code;
            return 'ko';
        }
    }).catch((error) => {
        if (error.response && error.response.data && error.response.data.code)
            return error.response.data.code;
        return 'ko';
    });
}

export async function login(user: string, password: string) {
    return await axios.post(`${API_BASE_URL}/auth/login`, {
        user,
        password
    }, {
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((response) => {
        if (response.status === 200) {
            if (!response.data.token)
                return 'ko';

            document.cookie = `token=${response.data.token}; path=/; expires=${new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30).toUTCString()}`;
            localStorage.setItem('token', response.data.token);

            return 'ok';
        } else {
            if (response.data && response.data.code)
                return response.data.code;
            return 'ko';
        }
    }).catch((error) => {
        if (error.response && error.response.data && error.response.data.code)
            return error.response.data.code;
        return 'ko';
    });
}
