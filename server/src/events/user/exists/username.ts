import { Request, Response } from "express";
import { Users } from "../../../controllers/users";
import { validateBody } from "../../../utils/requests";

let checkUsername = async (req: Request, res: Response) => {
    if (!validateBody(req.body, res, [
        { name: 'username', type: 'string' }
    ])) return;

    let username = req.body.username.toLowerCase();
    if (await Users.usernameExists(username)) {
        res.json({
            exists: true,
            message: 'Username already exists.'
        });
        return;
    }

    res.json({
        exists: false
    });
}

module.exports = {
    methods: ['GET', 'POST'],
    get: checkUsername,
    post: checkUsername
}
