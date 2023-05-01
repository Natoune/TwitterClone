import { Request, Response } from "express";
import { authorize, validateBody } from "../../utils/requests";
import { Interests } from "../../controllers/interests";
import { Users } from "../../controllers/users";

module.exports = {
    methods: ['GET', 'POST', 'DELETE'],
    post: async (req: Request, res: Response) => {
        validateBody(req.body, res, [
            { name: 'interests' }
        ]);

        let user = await authorize(req.headers.authorization);
        if (!user) return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });

        const interests = req.body.interests;
        if (!Array.isArray(interests)) return res.status(400).json({
            success: false,
            message: 'Invalid interests'
        });

        await Promise.all(interests.map(async (interest: string) => {
            if (typeof interest === 'string') {
                await Interests.findOne({ name: interest }).then(async (interest: any) => {
                    if (interest) {
                        user.interests.push(interest._id);
                    }
                });
            }
        }));

        Users.update(user._id, { interests: user.interests }).then((user: any) => {
            res.status(200).json({
                success: true,
                message: 'Interests updated'
            });
        }).catch((error: Error) => {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        });
    }
}
