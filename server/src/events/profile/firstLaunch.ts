import { Request, Response } from "express";
import { authorize } from "../../utils/requests";
import { Users } from "../../controllers/users";

module.exports = {
    methods: ['POST'],
    post: async (req: Request, res: Response) => {
        let user = await authorize(req.headers.authorization);
        if (!user) return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });

        Users.update(user._id, { firstLaunchDone: true }).then(() => {
            res.status(200).json({
                success: true,
                message: 'First launch done'
            });
        }).catch((err: any) => {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        });
    }
}
