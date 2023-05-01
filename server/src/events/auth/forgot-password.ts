import { Request, Response } from "express";
import { validateBody } from "../../utils/requests";
import { Users } from "../../controllers/users";
import logger from "../../utils/logger";
import nodemailer from "nodemailer";
import { APP_NAME, APP_URL, DKIM_PRIVATE_KEY, MAILER_FROM, MAILER_HOST, MAILER_PASS, MAILER_PORT, MAILER_SECURE, MAILER_USER } from "../../utils/constants";
import { MailOptions } from "nodemailer/lib/smtp-transport";
import { hashSync } from "bcrypt";

module.exports = {
    methods: ['POST'],
    post: async (req: Request, res: Response) => {
        if (!validateBody(req.body, res, [
            { name: 'action', type: 'string' },
            { name: 'email', type: 'string' },
            { name: 'code', type: 'string' },
            { name: 'password', type: 'string' }
        ])) return;

        let email = req.body.email;
        let code = req.body.code;
        let password = req.body.password;

        let user = await Users.findOne({ email });

        if (!user) {
            res.status(400).json({
                message: 'User not found',
                error: 'Aucun compte n\'est associé à l\'adresse email ' + email
            });
            return;
        }

        switch (req.body.action) {
            case 'send':
                sendMail(user, email, req, () => {
                    res.status(200).json({
                        message: 'The reset password email has been sent',
                    });
                }, () => {
                    res.status(500).json({
                        message: 'An error has occured while trying to send the reset password email',
                        error: "Nous n'avons pas pu envoyer l'email pour une raison inconue !<br/>Si le problème persiste, contactez le support."
                    });
                });
                break;
            case 'code':
                let ccode = checkCode(code, user, email, req, res);
                if (!ccode) return;

                res.status(200).json({
                    message: 'Code is valid',
                });

                break;
            case 'change':
                let ccode2 = checkCode(code, user, email, req, res);
                if (!ccode2) return;

                if (password.length < 8 || password.length > 32) {
                    res.status(400).json({
                        message: 'Invalid password',
                        error: 'Le mot de passe doit contenir entre 8 et 32 caractères !'
                    });
                    return;
                }

                password = hashSync(password, 10);

                Users.update(user._id, {
                    password: password,
                    resetPasswordToken: null,
                    resetPasswordTokenExpiration: null
                });

                res.status(200).json({
                    message: 'Password has been changed',
                });

                break;
            default:
                res.status(400).json({
                    message: 'Invalid action',
                    error: 'Une erreur inconue est survenue !<br/>Si le problème persiste, contactez le support.'
                });
                break;
        }
    }
}

async function checkCode(code: string, user: any, email: string, req: Request, res: Response) {
    if (code !== user.resetPasswordToken) {
        return res.status(400).json({
            message: 'Invalid code',
            error: 'Le code est invalide !'
        });
    }

    if (parseInt(user.resetPasswordTokenExpiration.toString()) < parseInt(Date.now().toString())) {
        return sendMail(user, email, req, () => {
            res.status(400).json({
                message: 'Code has expired',
                error: 'Ce code n\'est plus valide !<br/>Un nouveau code vous a été envoyé par email.'
            });
            return false;
        }, () => {
            res.status(500).json({
                message: 'Code has expired and an error has occured while trying to send the reset password email',
                error: "Ce code n\'est plus valide !"
            });
            return false;
        });
    } else {
        return true;
    }
}

async function sendMail(user: any, email: string, req: Request, _callback: Function, _callbackError: Function) {
    let newCode = Math.floor(Math.random() * 1000000);

    Users.update(user._id, {
        resetPasswordToken: newCode,
        resetPasswordTokenExpiration: Date.now() + 600000 // 10 minutes
    });

    logger.info(`Trying to send password reset email to ${email}... [${req.ip.magenta}]`);

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
        subject: 'Réinitialisation de mot de passe',
        list: {
            unsubscribe: [
                {
                    url: `${APP_URL}/unsubscribe`,
                    comment: 'Unsubscribe',
                }
            ]
        },
        headers: {
            'X-Entity-Ref-ID': user._id,
            'X-Entity-Ref-Type': 'user',
        },
        html: `
            <div style="width: 100%; height: fit-content; margin: 0; padding: 0; margin-top: 6rem; color: #333333; font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;">
                <div style="display: block; width: 100%; height: fit-content;">
                    <h1 style="font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; text-align: center; margin: 0;">
                        Réinitialisation de mot de passe
                        <span style="color: #e0a82e;">
                            ${APP_NAME}
                        </span>
                    </h1>
                    <p style="font-size: 1.25rem; line-height: 1.75rem; text-align: center; margin-top: 1.25rem;">
                        Entre le code suivant dans l'application ${APP_NAME} pour réinitialiser ton mot de passe :
                    </p>
                    <div style="display: block; width: fit-content; margin-left: auto; margin-right: auto; margin-top: 1.5rem;">
                        <span style="display: block; width: fit-content; font-size: 2rem; line-height: 2rem; letter-spacing: .3rem; margin-left: auto; margin-right: auto; color: #e0a82e;">
                            ${newCode}
                        </span>
                    </div>
                    <p style="font-size: 1.25rem; line-height: 1.75rem; text-align: center; margin-top: 2.5rem;">
                        Attention ! Ce code n'est valable que 10 minutes.
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
            Réinitialisation de mot de passe ${APP_NAME}
            Entre le code suivant dans l'application ${APP_NAME} pour réinitialiser ton mot de passe :
            ${newCode}
            Attention ! Ce code n'est valable que 10 minutes.
        `
    };

    transporter.sendMail(mailOptions, (error: Error | null) => {
        if (error) {
            logger.error(`An error has occured while trying to send the reset password email to ${email} [${req.ip.magenta}]: ${error.message}`);
            _callbackError();
        } else {
            logger.info(`The reset password email has been sent to ${email} [${req.ip.magenta}]`);
            _callback();
        }
    })
}
