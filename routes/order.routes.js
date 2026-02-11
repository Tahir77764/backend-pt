import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import authMiddleware from "../middlewares/auth.js";
import Product from "../models/Product.js";

import adminAuth from "../middlewares/adminAuth.js";

const router = express.Router();

router.get("/admin/orders", adminAuth, async (req, res) => {
    const orders = await Order.find().populate("user");
    res.json(orders);
});



// Create Order (Option 1: Seamless)
router.post("/create", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("cart.productId");
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.cart.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let totalAmount = 0;
        const orderItems = user.cart.map((item) => {
            const product = item.productId;
            if (!product) return null; // Should handle this case better if product deleted

            const price = product.discountedPrice || product.originalPrice || 0;
            totalAmount += price * item.quantity;
            return {
                productId: product._id,
                name: product.name,
                price: price, // Snapshot price
                quantity: item.quantity,
                logoUrl: item.logoUrl,
                videoUrl: item.videoUrl,
                customizationNote: item.customizationNote,
            };
        }).filter(item => item !== null);

        const discount = totalAmount > 999 ? totalAmount * 0.12 : 0;
        const finalTotal = totalAmount - discount;

        // Create new Order
        const newOrder = new Order({
            userId: req.user.id,
            items: orderItems,
            totalAmount: finalTotal
        });

        await newOrder.save();

        // Clear Cart
        user.cart = [];
        await user.save();

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get User Orders
router.get("/my-orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: Get All Orders
router.get("/all-orders", async (req, res) => {
    // Ideally verify admin role here
    try {
        const orders = await Order.find().populate("userId", "name email phone").sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: Update Order Status
router.put("/update-status/:id", async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: Delete Order
router.delete("/delete/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User: Cancel Order
router.put("/cancel/:id", authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.status === "Completed") {
            return res.status(400).json({ message: "Cannot cancel completed order" });
        }

        order.status = "Cancelled";
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
