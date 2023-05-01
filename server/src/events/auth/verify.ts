import { Request, Response } from "express";
import { validateBody } from "../../utils/requests";
import { verifyJwt } from "../../utils/jwt";
import { Users } from "../../controllers/users";
import logger from "../../utils/logger";

module.exports = {
    methods: ['POST'],
    post: async (req: Request, res: Response) => {
        if (!validateBody(req.body, res, [
            { name: 'action', type: 'string' },
            { name: 'token', type: 'string' }
        ])) return;

        const action = req.body.action;
        const token = req.body.token;

        if (action === 'verify') {
            let data = verifyJwt(token);

            if (data.error || !data._id || !data.token) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            let user = await Users.findOne({
                _id: data._id,
                token: data.token
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            Users.update(user._id, {
                verified: true
            });

            logger.info(`User ${user.username.italic} verified his email address (${user.email}) [${req.ip.magenta}]`);
            return res.status(200).json({
                success: true,
                message: 'Account verified'
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Action not found'
        });
    }
}
