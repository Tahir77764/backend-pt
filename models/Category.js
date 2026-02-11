import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: false }, // Cloudinary URL
    createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
