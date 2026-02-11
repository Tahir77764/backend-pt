import express from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import authMiddleware from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { v2 as cloudinary } from 'cloudinary';

const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, { resource_type: 'auto' });
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
};

const router = express.Router();

// Get User Cart
router.get("/get", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("cart.productId");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add to Cart
router.post("/add", authMiddleware, upload.single('designFile'), async (req, res) => {
    const { productId, quantity = 1, customizationNote } = req.body;

    try {
        // Handle Files
        let logoUrl = "";
        let videoUrl = "";

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' });
            if (result) {
                if (result.resource_type === 'video') {
                    videoUrl = result.secure_url;
                } else {
                    logoUrl = result.secure_url;
                }
            }
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Check if item already in cart (with exact same customization?)
        // Design choice: If customization is different, should it be a new item?
        // For simplicity, we will append as new item if it has customization, or complex matching.
        // But the previous logic matched by productId only.
        // If we want to support multiple items of same product with different logos, we shouldn't just match by productId.
        // However, User schema array structure is simple.
        // Let's modify logic: If customization exists, treat as unique? 
        // Or simpler: Always add as new entry if files are present? 
        // User request: "upload logo also should send with order".
        // Let's assume for now we just push to cart array if it has customization, OR we update logic to allow multiple same products.
        // But the schema is array of objects. We can just push.
        // But standard cart usually merges same item.
        // Let's merge ONLY if no customization. If customization, add new.

        const hasCustomization = logoUrl || videoUrl || customizationNote;

        let cartItemIndex = -1;
        if (!hasCustomization) {
            cartItemIndex = user.cart.findIndex(
                (item) => item.productId.toString() === productId && !item.logoUrl && !item.videoUrl
            );
        }

        if (cartItemIndex > -1) {
            // Update quantity
            user.cart[cartItemIndex].quantity += Number(quantity);
        } else {
            // Add new item
            user.cart.push({
                productId,
                quantity: Number(quantity),
                logoUrl,
                videoUrl,
                customizationNote
            });
        }

        await user.save();

        // Return updated cart
        const updatedUser = await User.findById(req.user.id).populate("cart.productId");
        res.json({ message: "Added to cart", cart: updatedUser.cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Quantity
router.post("/update", authMiddleware, async (req, res) => {
    const { productId, type } = req.body; // type: 'inc' or 'dec'

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const cartItem = user.cart.find(
            (item) => item.productId.toString() === productId
        );

        if (!cartItem) return res.status(404).json({ message: "Item not in cart" });

        if (type === "inc") {
            cartItem.quantity += 1;
        } else if (type === "dec") {
            cartItem.quantity -= 1;
            if (cartItem.quantity <= 0) {
                // Remove item if qty is 0
                user.cart = user.cart.filter(
                    (item) => item.productId.toString() !== productId
                );
            }
        }

        await user.save();

        const updatedUser = await User.findById(req.user.id).populate("cart.productId");
        res.json({ message: "Cart updated", cart: updatedUser.cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove Item
router.post("/remove", authMiddleware, async (req, res) => {
    const { productId } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.cart = user.cart.filter(
            (item) => item.productId.toString() !== productId
        );

        await user.save();

        const updatedUser = await User.findById(req.user.id).populate("cart.productId");
        res.json({ message: "Item removed", cart: updatedUser.cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
