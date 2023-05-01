import { User, UserData, userModel } from "../models/user";
import Jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants";
import { compareSync, hashSync } from "bcrypt";

export let Users = {
    async create(data: UserData): Promise<{ success?: boolean, user?: any, error?: Error }> {
        let user = new userModel({
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            displayName: data.displayName,
            email: data.email,
            birth: {
                day: data.birth.day,
                month: data.birth.month,
                year: data.birth.year
            },
            password: data.password
        });

        return await user.save().then(() => {
            return { success: true, user };
        }).catch((error: Error) => {
            return { error };
        });
    },
    async update(id: string, data: any): Promise<User | null> {
        return await userModel.findByIdAndUpdate(id, data, {
            upsert: true,
            new: true
        }).then((user: any) => {
            return user;
        }).catch((error: Error) => {
            return null;
        });
    },
    async delete(id: string): Promise<boolean> {
        return await userModel.findByIdAndDelete(id).then(() => {
            return true;
        }).catch((error: Error) => {
            return false;
        });
    },
    async findOne(query: any): Promise<User | null> {
        return await userModel.findOne(query).then((user: any) => {
            return user;
        }).catch((error: Error) => {
            return false;
        });
    },
    async find(query: any): Promise<User[] | null> {
        return await userModel.find(query).then((users: any) => {
            return users;
        }).catch((error: Error) => {
            return false;
        });
    },
    async emailExists(email: string): Promise<boolean> {
        let entry = await userModel.findOne({ email: email });
        return entry !== null;
    },
    async usernameExists(username: string): Promise<boolean> {
        let entry = await userModel.findOne({ username: username });
        return entry !== null;
    },
    comparePassword(password: string, hash: string): boolean {
        return compareSync(hashSync(password, 10), hash) || compareSync(password, hash);
    },
    generateJWT(user: User | UserData): string {
        return Jwt.sign({
            _id: user._id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            birth: user.birth,
            avatar: user.avatar,
            following: user.following,
            followers: user.followers,
            interests: user.interests,
            verified: user.verified,
            firstLaunchDone: user.firstLaunchDone,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }, JWT_SECRET!, {
            expiresIn: 3600 * 24 * 30, // 30 days
            algorithm: 'HS256'
        });
    }
}
