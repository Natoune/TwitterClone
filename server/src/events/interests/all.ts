import { Request, Response } from "express";
import { Interests } from "../../controllers/interests";

module.exports = {
    methods: ['GET'],
    get: async (req: Request, res: Response) => {
        const interests = await Interests.find({});
        if (!interests) return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

        return res.status(200).json({
            success: true,
            message: 'Interests retrieved',
            interests
        });
    }
}
