import { Interest, interestModel } from "../models/interest";
import { Users } from "./users";

export let Interests = {
    async findOne(query: any): Promise<Interest | null> {
        return await interestModel.findOne(query).then((interest: any) => {
            return interest;
        }).catch((error: Error) => {
            return false;
        });
    },
    async find(query: any): Promise<Interest[] | null> {
        return await interestModel.find(query).then((interests: any) => {
            return interests;
        }).catch((error: Error) => {
            return false;
        });
    },
    async getUserInterests(userId: string): Promise<Interest[] | null> {
        return await Users.findOne({ _id: userId }).then(async (user: any) => {
            if (!user) return null;
            return await interestModel.find({
                _id: {
                    $in: user.interests
                }
            }).then((interests: any) => {
                return interests;
            }).catch((error: Error) => {
                return null;
            });
        }).catch((error: Error) => {
            return null;
        });
    },
}
