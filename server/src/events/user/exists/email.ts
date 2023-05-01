import { Request, Response } from "express";
import { Users } from "../../../controllers/users";
import { validateBody } from "../../../utils/requests";

let checkEmail = async (req: Request, res: Response) => {
    if (!validateBody(req.body, res, [
        { name: 'email', type: 'string' }
    ])) return;

    let email = req.body.email.toLowerCase();
    email = email.replace(/\+.*(?=@)/, '');
    if (await Users.emailExists(email)) {
        res.json({
            exists: true,
            message: 'Email already exists.'
        });
        return;
    }

    res.json({
        exists: false
    });
}

module.exports = {
    methods: ['GET', 'POST'],
    get: checkEmail,
    post: checkEmail
}
