import { Request, Response } from "express";
import { authorize, validateBody } from "../../utils/requests";
import { Users } from "../../controllers/users";
import logger from "../../utils/logger";

module.exports = {
    methods: ['POST'],
    post: async (req: Request, res: Response) => {
        let user = await authorize(req.headers.authorization);
        if (!user) return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });

        let refresh_token = Users.generateJWT(user);

        res.status(200).json({
            success: true,
            message: 'Token refreshed',
            token: refresh_token
        });
    }
}
