import { Response } from "express";
import { verifyJwt } from "./jwt";
import { Users } from "../controllers/users";

export function isBodyEmpty(body: any) {
    return Object.keys(body).length === 0;
}

export function isParamsValid(body: any, fields: Array<{ name: string, type?: string, subValues?: any }>) {
    for (let field of fields) {
        try {
            if (!body.hasOwnProperty(field.name))
                return false;
        } catch {
            return false;
        }

        if (field.type && typeof body[field.name] !== field.type)
            return false;

        if (field.subValues) {
            if (!isParamsValid(body[field.name], field.subValues))
                return false;
        }
    }
    return true;
}

export function validateBody(body: any, res: Response, fields: Array<{ name: string, type?: "undefined" | "object" | "boolean" | "number" | "bigint" | "string" | "symbol" | "function" | "object", subValues?: any }>){
    if (!body) {
        res.status(400).json({
            success: false,
            message: 'Body is undefined'
        });
        return false;
    }

    if (isBodyEmpty(body)) {
        res.status(400).json({
            success: false,
            message: 'Body is empty'
        });
        return false;
    }

    if (!isParamsValid(body, fields)) {
        res.status(400).json({
            success: false,
            message: 'Invalid params'
        });
        return false;
    }

    return true;
}

export async function authorize(token: string | undefined): Promise<any> {
    if (!token) {
        return null;
    }

    token = token.replace('Bearer ', '');

    const jwt = verifyJwt(token);
    if (jwt.error) {
        return null;
    }

    const user = await Users.findOne({ _id: jwt._id });
    if (!user) {
        return null;
    }

    return user;
}
