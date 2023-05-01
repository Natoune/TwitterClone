import { LOCALE } from "./constants";
import winston from "winston";
import "colors";

class Logger {
    logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.printf((info) => {
                let date = new Date().toISOString();
                let level = info.level.toUpperCase();
                let message = info.message.replace(/\u001b\[\d{1,2}m/g, '');

                return `[${date}] [${level}]: ${message}`;
            }),
            transports: [
                new winston.transports.File({
                    dirname: 'logs',
                    filename: 'error.log',
                    level: 'error'
                }),
                new winston.transports.File({
                    dirname: 'logs',
                    filename: 'combined.log'
                }),
                new winston.transports.Console({
                    format: winston.format.printf((info) => {
                        let level = info.level.toUpperCase();
                        switch (level) {
                            case 'INFO':
                                level = level.green;
                                break;
                            case 'ERROR':
                                level = level.red;
                                break;
                            default:
                                break;
                        }

                        let date = (new Date().toLocaleDateString(LOCALE) + ' ' + new Date().toLocaleTimeString(LOCALE)).grey;
                        return `[${date}] [${level}]: ${info.message}`;
                    })
                })
            ],
        });
    }
    info(message: string) {
        this.logger.info(
            `${message}`
        );
    }
    error(message: string) {
        this.logger.error(
            `${message}`
        );
    }
}

export default new Logger();
