// nextjs-reactjs-practice-2026/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    throw new Error('MONGO_URI is not defined in environment variables');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;

// nextjs-reactjs-practice-2026/config/db.js