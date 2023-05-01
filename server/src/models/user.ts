import mongoose, { ObjectId } from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 32
    },
    lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 32
    },
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
        minlength: 4,
        maxlength: 32
    },
    displayName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        maxlength: 255,
        validate: {
            validator: (email: string) => {
                return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            },
            message: 'Invalid email'
        }
    },
    birth: {
        type: Object,
        required: true,
        validate: {
            validator: (birth: any) => {
                return birth.day >= 1 && birth.day <= 31 && birth.month >= 1 && birth.month <= 12 && birth.year >= new Date().getFullYear() - 100 && birth.year <= new Date().getFullYear() - 13;
            },
            message: 'Invalid birth date'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 255
    },
    avatar: {
        type: String,
        default: '000000000000000000000000.png'
    },
    following: {
        type: Array,
        default: []
    },
    followers: {
        type: Array,
        default: []
    },
    interests: {
        type: Array,
        default: []
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordTokenExpiration: {
        type: Date,
        default: null
    },
    firstLaunchDone: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export let userModel = mongoose.model('User', userSchema);
export type UserData = {
    _id?: any,
    firstName: string,
    lastName: string,
    username: string,
    displayName: string,
    email: string,
    birth: {
        day: number,
        month: number,
        year: number
    },
    password: string,
    avatar?: string,
    following?: string[],
    followers?: string[],
    interests?: string[]
    verified?: boolean,
    verificationToken?: string,
    resetPasswordToken?: string,
    resetPasswordTokenExpiration?: Date,
    firstLaunchDone?: boolean,
    createdAt?: Date,
    updatedAt?: Date
}
export interface User extends UserData, mongoose.Document { }
