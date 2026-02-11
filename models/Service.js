import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String, required: false },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Service = mongoose.model("Service", serviceSchema);
export default Service;
