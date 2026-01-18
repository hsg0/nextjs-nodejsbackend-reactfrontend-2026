// nextjs-reactjs-practice-2026:backend/models/userDataModel.js

import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const webDB = mongoose.connection.useDb('webSiteDatabase');

const userDataSchema = new mongoose.Schema({
    userDataNanoId: {
        type: String,
        default: () => nanoid(10),
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    age: {
        type: Number,
        required: true,
        min: 0,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

// Prevent model overwrite in dev hot-reload
const UserDataModel =
    webDB.models.UserData || webDB.model('UserData', userDataSchema, 'userdata');

export default UserDataModel;