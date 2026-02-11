import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import VideoStory from './models/VideoStory.js';
import connectMongoDB from './connect-mongodb.js';

const migrateVideos = async () => {
    try {
        await connectMongoDB();
        console.log("Connected to MongoDB for Migration");

        const productsWithVideo = await Product.find({ video: { $exists: true, $ne: "" } });
        console.log(`Found ${productsWithVideo.length} products with videos.`);

        let count = 0;
        for (const product of productsWithVideo) {
            // Check if story already exists for this video to avoid duplicates
            const existing = await VideoStory.findOne({ video: product.video });
            if (!existing) {
                const newStory = new VideoStory({
                    title: product.name,
                    video: product.video,
                    productId: product._id,
                    productName: product.name,
                    isActive: true
                });
                await newStory.save();
                console.log(`Migrated: ${product.name}`);
                count++;
            } else {
                console.log(`Skipped existing: ${product.name}`);
            }
        }

        console.log(`Migration Complete. Added ${count} new VideoStories.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
};

migrateVideos();
