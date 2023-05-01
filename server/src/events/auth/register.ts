import { Request, Response } from "express";
import { validateBody } from "../../utils/requests";
import { APP_NAME, APP_URL, DKIM_PRIVATE_KEY, JWT_SECRET, MAILER_FROM, MAILER_HOST, MAILER_PASS, MAILER_PORT, MAILER_SECURE, MAILER_USER, MIN_AGE, RECAPTCHA_V2_SECRET, RECAPTCHA_V3_SECRET } from "../../utils/constants";
import axios from "axios";
import { Users } from "../../controllers/users";
import { hashSync } from "bcrypt";
import logger from "../../utils/logger";
import Jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/smtp-transport";
import { signJwt } from "../../utils/jwt";

const bissextile = (year: number) => {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};
const daysInMonth = (month: number, year: number) => {
    switch (month) {
        case 2:
            return bissextile(year) ? 29 : 28;
        case 4:
        case 6:
        case 9:
        case 11:
            return 30;
        default:
            return 31;
    }
};

module.exports = {
    methods: ['POST'],
    post: async (req: Request, res: Response) => {
        if (!validateBody(req.body, res, [
            { name: 'name', type: 'string' },
            { name: 'username', type: 'string' },
            { name: 'email', type: 'string' },
            { name: 'birth', type: 'object', subValues: [
                { name: 'day', type: 'number' },
                { name: 'month', type: 'number' },
                { name: 'year', type: 'number' }
            ] },
            { name: 'password', type: 'string' },
            { name: 'recaptcha', type: 'string' }
        ])) return;

        let firstName = req.body.name.split(' ')[0];
        let lastName = req.body.name.split(' ')[1];
        let username = req.body.username;
        let email = req.body.email;
        let birth = req.body.birth;
        let password = req.body.password;

        if (
            // Name
            !firstName || !lastName ||
            firstName.length < 2 || lastName.length < 2 || firstName.length > 32 || lastName.length > 32 ||
            // Username
            username.length < 4 || username.length > 32 ||
            await Users.usernameExists(username) ||
            // Email
            email.length > 255 ||
            !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ||
            await Users.emailExists(email) ||
            // Birth
            !birth || !birth.day || !birth.month || !birth.year ||
            birth.day < 1 || birth.day > 31 ||
            birth.month < 1 || birth.month > 12 ||
            birth.year < new Date().getFullYear() - 100 - parseInt(MIN_AGE) || birth.year > new Date().getFullYear() - parseInt(MIN_AGE) ||
            birth.day > daysInMonth(birth.month, birth.year) ||
            (
                birth.day === 29 &&
                birth.month === 2 &&
                !bissextile(birth.year)
            ) ||
            // Password
            password.length < 8 || password.length > 32
        ) {
            return res.status(400).json({
                message: 'Bad Request'
            });
        }

        let recaptchaResponse = req.body.recaptcha;
        let recaptchaSecret = recaptchaResponse.startsWith('v2') ? RECAPTCHA_V2_SECRET : RECAPTCHA_V3_SECRET;
        recaptchaResponse = recaptchaResponse.substring(2);

        let isValidCaptcha = await axios.post('https://www.google.com/recaptcha/api/siteverify', {
            secret: recaptchaSecret,
            response: recaptchaResponse
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((response: any) => {
            if (!response.data || !response.data.success) {
                return false;
            }
            return true;
        });

        if (!isValidCaptcha) {
            return res.status(400).json({
                message: 'Bad Request',
                code: 'invalid-recaptcha'
            });
        }

        let query = await Users.create({
            firstName: firstName.toLowerCase().charAt(0).toUpperCase() + firstName.toLowerCase().slice(1),
            lastName: lastName.toLowerCase().charAt(0).toUpperCase() + lastName.toLowerCase().slice(1),
            username: username.toLowerCase(),
            displayName: firstName.toLowerCase().charAt(0).toUpperCase() + firstName.toLowerCase().slice(1) + ' ' + lastName.toLowerCase().charAt(0).toUpperCase() + lastName.toLowerCase().slice(1),
            email: email.toLowerCase(),
            birth,
            password: hashSync(password, 10),
        });

        if (query.error) {
            logger.error(`An error has occured while trying to create the ${username} account [${req.ip.magenta}]: ${query.error.message}`);
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }

        let verificationToken = signJwt({
            id: query.user._id,
            token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        });

        Users.update(query.user._id, {
            verificationToken
        });

        logger.info(`The ${username.italic} account has been created [${req.ip.magenta}]`);

        res.status(200).json({
            message: 'Successfully created account',
            token: Users.generateJWT(query.user)
        });

        /* EMAIL VERIFICATION */
        logger.info(`Trying to send verification email to ${email}... [${req.ip.magenta}]`);

        let transporter = nodemailer.createTransport({
            // @ts-ignore
            host: MAILER_HOST,
            port: MAILER_PORT,
            secure: (MAILER_SECURE === '1' ? true : false),
            tls: {
                rejectUnauthorized: false,
            },
            auth: {
                user: MAILER_USER,
                pass: MAILER_PASS
            },
            dkim: {
                domainName: MAILER_USER.split('@')[1],
                keySelector: 'dkim',
                privateKey: DKIM_PRIVATE_KEY
            }
        });

        let mailOptions: MailOptions = {
            from: MAILER_FROM,
            to: email,
            subject: 'Bienvenue sur ' + APP_NAME + ' !',
            list: {
                unsubscribe: [
                    {
                        url: `${APP_URL}/unsubscribe`,
                        comment: 'Unsubscribe',
                    }
                ]
            },
            headers: {
                'X-Entity-Ref-ID': query.user._id,
                'X-Entity-Ref-Type': 'user',
            },
            html: `
                <div style="width: 100%; height: fit-content; margin: 0; padding: 0; margin-top: 6rem; color: #333333; font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;">
                    <div style="display: block; width: 100%; height: fit-content;">
                        <h1 style="font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; text-align: center; margin: 0;">
                            Bienvenue ${firstName} sur
                            <span style="color: #e0a82e;">
                                ${APP_NAME}<span style="color:#333333">&nbsp;!</span>
                            </span>
                        </h1>
                        <p style="font-size: 1.25rem; line-height: 1.75rem; text-align: center; margin-top: 1.25rem;">
                            Pour finaliser ton inscription, clique sur le bouton ci-dessous et vérifie ton adresse mail.
                        </p>
                        <div style="display: block; width: fit-content; margin-left: auto; margin-right: auto; margin-top: 1.5rem;">
                            <a href="${APP_URL}/verify/?token=${verificationToken}" style="padding-left: 1rem; padding-right: 1rem; padding-top: 1rem; padding-bottom: 1rem; font-size: 0.875rem; font-weight: 600; color:#333333; background-color: #e0a82e; text-align: center; display: block; cursor: pointer; border: none; border-radius: 0.5rem; text-transform: uppercase; text-decoration: none;">
                                Vérifier mon adresse mail
                            </a>
                        </div>
                        <span style="display: block; width: fit-content; font-size: 1.5rem; line-height: 2rem; margin-top: 2.5rem; margin-left: auto; margin-right: auto;">
                            OU
                        </span>
                        <p style="font-size: 1.25rem; line-height: 1.75rem; text-align: center;">
                            Copie-colle le lien suivant dans ton navigateur :
                            <br>
                            <span style="color: #e0a82e; max-width: 100%;">
                                ${APP_URL}/verify/?token=${verificationToken}
                            </span>
                        </p>
                        <p style="font-size: 1.25rem; line-height: 1.75rem; text-align: center; margin-top: 2.5rem;">
                            À bientôt sur
                            <span style="color: #e0a82e">
                                ${APP_NAME}<span style="color:#333333">&nbsp;!</span>
                            </span>
                        </p>
                    </div>
                    <div style="margin-top: 3.5rem; width: 100%; text-align: center; background-color: #f2f2f2; padding-top: 1.25rem; padding-bottom: 1.25rem;">
                        <span style="font-size: 1.125rem; line-height: 1.75rem; text-align: center;">
                            Ceci est un mail automatique, merci de ne pas y répondre.
                            <br>
                            Si vous n'êtes pas à l'origine de cette demande, ignorez ce mail.
                        </span>
                        <div style="font-size: 1.25rem; line-height: 1.75rem; display: block; margin-top: 1.5rem; text-align: center;">
                            <p style="margin: 0 1.25rem; display: inline;">
                                <a href="${APP_URL}/unsubscribe?email=${email}" style="color: #181830;">
                                    Se désinscrire
                                </a>
                            </p>
                            <p style="margin: 0 1.25rem; display: inline;">
                                ${APP_NAME}&nbsp;©&nbsp;${new Date().getFullYear()}
                            </p>
                            <p style="margin: 0 1.25rem; display: inline;">
                                <a href="${APP_URL}/support" style="color: #181830;">
                                    Support
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            `,
            text: `
                Bienvenue ${firstName} sur ${APP_NAME} !
                Pour finaliser ton inscription, copie-colle le lien suivant dans ton navigateur :
                ${APP_URL}/verify/?token=${verificationToken}
                À bientôt sur ${APP_NAME} !
            `
        };

        transporter.sendMail(mailOptions, (error: Error | null) => {
            if (error) {
                logger.error(`An error has occured while trying to send the verification email to ${email} [${req.ip.magenta}]: ${error.message}`);
            } else {
                logger.info(`The verification email has been sent to ${email} [${req.ip.magenta}]`);
            }
        });
    }
}
