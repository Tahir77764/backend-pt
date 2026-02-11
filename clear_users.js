import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config';

const cleanUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        await User.deleteMany({});
        console.log("All users successfully deleted.");
        process.exit(0);
    } catch (error) {
        console.error("Error clearing users:", error);
        process.exit(1);
    }
};

cleanUsers();
