import { Request, Response } from "express";
import { Users } from "../../controllers/users";
import path from "path";
import fs from "fs";
import { authorize } from "../../utils/requests";

module.exports = {
    methods: ['POST'],
    post: async (req: Request, res: Response) => {
        if (!req.files || req.files.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Missing files'
            });
            return;
        }

        // @ts-ignore
        let file = req.files[0];
        if (!file.mimetype.startsWith('image/')) {
            res.status(400).json({
                success: false,
                message: 'Invalid file type'
            });
            return;
        }

        if (!file.buffer) {
            res.status(400).json({
                success: false,
                message: 'Missing file buffer'
            });
            return;
        }

        let user = await authorize(req.headers.authorization);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
            return;
        }

        fs.writeFileSync(path.join(__dirname, '..', '..', '..', 'public', 'usercontent', 'avatar', `${user._id}.${file.mimetype.split('/')[1]}`), file.buffer);

        Users.update(user._id, {
            avatar: `${user._id}.${file.mimetype.split('/')[1]}`
        });

        res.status(200).json({
            success: true,
            message: 'User picture updated',
        });
    }
}
