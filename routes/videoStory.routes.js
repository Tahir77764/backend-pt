import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import upload from '../middlewares/multer.js';
import VideoStory from '../models/VideoStory.js';

const router = express.Router();

// Helper: Specific upload for image vs video
const uploadFileToCloudinary = async (filePath, type = 'auto') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, { resource_type: type });
        return result.secure_url;
    } catch (error) {
        console.error(`Cloudinary ${type} Upload Error:`, error);
        throw new Error(`${type} upload failed`);
    }
};

// GET All Video Stories
router.get('/', async (req, res) => {
    try {
        const stories = await VideoStory.find({ isActive: true }).sort({ createdAt: -1 }).populate('productId', 'name discountedPrice originalPrice slug');
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST New Video Story
// We now expect multiple fields: 'video' and 'productImage'
router.post('/', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'productImage', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, productName, price } = req.body;
        let videoUrl = "";
        let productImageUrl = "";

        // Handle Video
        if (req.files['video'] && req.files['video'][0]) {
            videoUrl = await uploadFileToCloudinary(req.files['video'][0].path, 'video');
        } else {
            return res.status(400).json({ message: "Video file is required" });
        }

        // Handle Product Image (Optional but requested)
        if (req.files['productImage'] && req.files['productImage'][0]) {
            productImageUrl = await uploadFileToCloudinary(req.files['productImage'][0].path, 'image');
        }

        const newStory = new VideoStory({
            title,
            video: videoUrl,
            productName,
            price: price ? Number(price) : undefined,
            productImage: productImageUrl
        });

        await newStory.save();
        res.status(201).json({ message: "Video Story created", story: newStory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE Video Story
router.delete('/:id', async (req, res) => {
    try {
        await VideoStory.findByIdAndDelete(req.params.id);
        res.json({ message: "Video Story deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT Update Video Story
router.put('/:id', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'productImage', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, productName, price } = req.body;
        const updateData = {
            title,
            productName,
            price: price ? Number(price) : undefined
        };

        // Handle Video Update
        if (req.files && req.files['video'] && req.files['video'][0]) {
            const videoUrl = await uploadFileToCloudinary(req.files['video'][0].path, 'video');
            updateData.video = videoUrl;
        }

        // Handle Product Image Update
        if (req.files && req.files['productImage'] && req.files['productImage'][0]) {
            const productImageUrl = await uploadFileToCloudinary(req.files['productImage'][0].path, 'image');
            updateData.productImage = productImageUrl;
        }

        const updatedStory = await VideoStory.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updatedStory) {
            return res.status(404).json({ message: "Video Story not found" });
        }

        res.json({ message: "Video Story updated", story: updatedStory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
