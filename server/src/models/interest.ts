import mongoose from "mongoose";

const interestSchema = new mongoose.Schema({
    name: String,
    icon: String
});

export let interestModel = mongoose.model('Interest', interestSchema);

export type InterestData = {
    _id?: any,
    name: string,
    icon: string
}

export interface Interest extends InterestData, mongoose.Document { }
