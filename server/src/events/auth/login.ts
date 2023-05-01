import { Request, Response } from "express";
import { validateBody } from "../../utils/requests";
import { Users } from "../../controllers/users";
import logger from "../../utils/logger";

module.exports = {
    methods: ['POST'],
    post: async (req: Request, res: Response) => {
        if (!validateBody(req.body, res, [
            { name: 'user', type: 'string' },
            { name: 'password', type: 'string' }
        ])) return;

        const user = req.body.user;
        const password = req.body.password;

        const userQuery = await Users.findOne({
            $or: [
                { username: user },
                { email: user }
            ]
        });

        if (!userQuery) {
            res.status(401).json({
                message: "User not found",
                code: "invalid-user"
            });
            return;
        }

        const passwordMatch = Users.comparePassword(password, userQuery.password);

        if (!passwordMatch) {
            res.status(401).json({
                message: "Invalid password",
                code: "invalid-password"
            });
            return;
        }

        const token = Users.generateJWT(userQuery);

        logger.info(`User ${userQuery.username.italic} logged in [${req.ip.magenta}]`);
        res.status(200).json({
            message: "Successfully logged in",
            token
        });
    }
}
