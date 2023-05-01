import { Request, Response } from "express";
import { authorize, validateBody } from "../../utils/requests";
import { Users } from "../../controllers/users";

module.exports = {
    methods: ['POST'],
    post: async (req: Request, res: Response) => {
        validateBody(req.body, res, [
            { name: 'displayName', type: 'string' }
        ]);

        let user = await authorize(req.headers.authorization);
        if (!user) return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });

        let displayName = req.body.displayName;
        if (displayName.length < 3 || displayName.length > 20) return res.status(400).json({
            success: false,
            message: 'Name must be between 3 and 20 characters'
        });

        Users.update(user._id, { displayName }).then(() => {
            res.status(200).json({
                success: true,
                message: 'Display name updated'
            });
        }).catch((err: any) => {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        });
    }
}
