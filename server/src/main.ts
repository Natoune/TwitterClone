import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import serveStatic from 'serve-static';
import cors from 'cors';
import logger from './utils/logger';
import requireAll from 'require-all';
import path from 'path';
import { PORT } from './utils/constants';
import fs from 'fs';

import './utils/database';

const app = express();
const upload = multer();

app.use(serveStatic(path.join(__dirname, '..', 'public'), {
    maxAge: '1y',
    dotfiles: 'ignore'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.all('/api/*', upload.any(), async (req, res) => {
    logger.info('');
    logger.info(`Request: ${req.method.green} ${req.originalUrl.cyan}`);
    logger.info(`Body: ${JSON.stringify(req.body).black}`);
    logger.info(`Headers: ${JSON.stringify(req.headers).black}`);
    logger.info(`User: ${req.ip.magenta}`);
    logger.info('');

    const events = requireAll({
        dirname: path.join(__dirname, 'events'),
        filter: /(.+)\.ts$/,
        recursive: true
    });

    const urlDecomposed = req.originalUrl.split('/');
    urlDecomposed.shift();
    urlDecomposed.shift();

    let lastEvent = events;
    for (let urlPart of urlDecomposed) {
        if (lastEvent[urlPart]) {
            const event = lastEvent[urlPart][req.method.toLowerCase()];
            if (event) {
                event(req, res);
                return;
            }

            if (lastEvent[urlPart]['methods']) {
                if (req.method.toLowerCase() === 'options') {
                    res.header('Allow', lastEvent[urlPart]['methods'].join(','));
                    res.header('Access-Control-Allow-Methods', lastEvent[urlPart]['methods'].join(',') + ',OPTIONS');
                    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                    res.header('Access-Control-Allow-Origin', '*');
                    res.status(200);
                    res.send();
                    return;
                }

                return res.status(405).json({
                    message: 'Method Not Allowed',
                    allowedMethods: lastEvent[urlPart]['methods']
                });
            }
        }

        lastEvent = lastEvent[urlPart];
    }

    res.status(404).json({
        message: 'Not Found'
    });
});

app.get('/usercontent/avatar/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'usercontent', 'avatar', '000000000000000000000000.png'));
});

app.all('*', (req, res) => {
    if (fs.existsSync(path.join(__dirname, '..', 'public', 'index.html'))) {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    } else {
        res.status(404).json({
            message: 'Not Found'
        });
    }
});

app.listen(PORT, () => {
    logger.info(`Server listening at `.yellow + `http://localhost:${PORT}`.cyan.underline);
});
