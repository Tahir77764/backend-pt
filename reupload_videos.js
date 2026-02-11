import 'dotenv/config';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import VideoStory from './models/VideoStory.js';
import Product from './models/Product.js';
import connectMongoDB from './connect-mongodb.js';
import cloudinaryConnect from './connect-cloudinary.js';

// Absolute Path to Frontend Public Videos
const VIDEO_DIR = path.resolve('..', 'VT - Printz Frontend', 'public');

const reuploadVideos = async () => {
    try {
        await connectMongoDB();
        await cloudinaryConnect();

        console.log("Connected to DB & Cloudinary");

        // 1. DELETE ALL existing video stories
        await VideoStory.deleteMany({});
        console.log("Deleted all existing VideoStories from database.");

        // 2. Find Products that have a local video path
        // We look for 'video' field that starts with '/' (indicating local path)
        // Adjust regex if needed. video: { $regex: /^\// }
        // Actually, just find ALL products with video and check if it's a file
        const products = await Product.find({ video: { $exists: true, $ne: "" } });
        console.log(`Found ${products.length} products with a video field.`);

        for (const product of products) {
            const videoPath = product.video;

            // Check if it's already a URL (http/https)
            if (videoPath.startsWith('http')) {
                console.log(`Skipping ${product.name}, already a URL: ${videoPath}`);
                // Re-create the VideoStory for it though, since we wiped the collection
                const newStory = new VideoStory({
                    title: product.name,
                    video: videoPath,
                    productId: product._id,
                    productName: product.name,
                    isActive: true
                });
                await newStory.save();
                continue;
            }

            // Construct local file path
            // videoPath is likely "/videos/foo.mp4"
            // We need to join it properly
            const relativePath = videoPath.startsWith('/') ? videoPath.substring(1) : videoPath;
            const absoluteFilePath = path.join(VIDEO_DIR, relativePath);

            if (fs.existsSync(absoluteFilePath)) {
                console.log(`Uploading local file: ${absoluteFilePath}`);
                try {
                    const result = await cloudinary.uploader.upload(absoluteFilePath, {
                        resource_type: 'video',
                        folder: 'vt_printz_videos' // Optional folder in Cloudinary
                    });

                    const cloudUrl = result.secure_url;
                    console.log(`Uploaded to: ${cloudUrl}`);

                    // Create new VideoStory
                    const newStory = new VideoStory({
                        title: product.name,
                        video: cloudUrl,
                        productId: product._id,
                        productName: product.name,
                        isActive: true
                    });
                    await newStory.save();

                    // Optional: Update Product to point to Cloudinary URL too
                    product.video = cloudUrl;
                    await product.save();
                    console.log(`Updated Product ${product.name} with new URL.`);

                } catch (uploadErr) {
                    console.error(`Failed to upload ${absoluteFilePath}:`, uploadErr);
                }
            } else {
                console.warn(`File not found: ${absoluteFilePath}`);
            }
        }

        console.log("Re-upload process complete.");
        process.exit(0);

    } catch (error) {
        console.error("Script Failed:", error);
        process.exit(1);
    }
};

reuploadVideos();
