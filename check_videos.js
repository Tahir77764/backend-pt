import 'dotenv/config';
import mongoose from 'mongoose';
import VideoStory from './models/VideoStory.js';
import connectMongoDB from './connect-mongodb.js';

const checkVideos = async () => {
    try {
        await connectMongoDB();
        console.log("Connected to MongoDB");

        const count = await VideoStory.countDocuments();
        console.log(`VideoStory Count: ${count}`);

        const videos = await VideoStory.find();
        console.log("Videos:", JSON.stringify(videos, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkVideos();
