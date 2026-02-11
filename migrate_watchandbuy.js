import mongoose from 'mongoose';
import dotenv from 'dotenv';
import VideoStory from './models/VideoStory.js';
import WatchAndBuy from './models/WatchAndBuy.js';
import connectMongoDB from './connect-mongodb.js';

dotenv.config();

const migrate = async () => {
    try {
        await connectMongoDB();
        console.log("Connected to MongoDB for migration...");

        const videoStories = await VideoStory.find({});
        console.log(`Found ${videoStories.length} existing Video Stories.`);

        if (videoStories.length === 0) {
            console.log("No video stories to migrate.");
            process.exit(0);
        }

        const watchAndBuyItems = videoStories.map(story => ({
            title: story.title,
            video: story.video,
            productId: story.productId,
            productName: story.productName,
            price: story.price,
            productImage: story.productImage,
            views: story.views,
            isActive: story.isActive,
            createdAt: story.createdAt
        }));

        // Optional: clear existing watch & buy items to avoid duplicates during dev
        await WatchAndBuy.deleteMany({});
        console.log("Cleared existing WatchAndBuy collection.");

        await WatchAndBuy.insertMany(watchAndBuyItems);
        console.log(`Successfully migrated ${watchAndBuyItems.length} items to WatchAndBuy collection.`);

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

migrate();
