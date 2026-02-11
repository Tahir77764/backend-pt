import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    image: { type: String, required: false }, // Main image
    video: { type: String, required: false }, // Product video
    gallery: [{ type: String }], // Additional images
    description: { type: String },
    features: [{ type: String }], // Array of strings
    originalPrice: { type: Number },
    discountedPrice: { type: Number },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
