import mongoose from "mongoose";

const watchAndBuySchema = new mongoose.Schema({
    title: { type: String, required: true },
    video: { type: String, required: true }, // URL to the video
    // Optional: link to a product if you want "Shop Now" to go somewhere specific
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String }, // Fallback or separate label
    price: { type: Number },
    productImage: { type: String }, // image for the product passport size
    views: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const WatchAndBuy = mongoose.model("WatchAndBuy", watchAndBuySchema);
export default WatchAndBuy;
