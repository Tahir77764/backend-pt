import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import upload from '../middlewares/multer.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import Product from '../models/Product.js';

const router = express.Router();

// Helper: Upload file to Cloudinary
const uploadToCloudinary = async (filePath) => {
    try {
        console.log("Starting Cloudinary Upload for:", filePath);
        const result = await cloudinary.uploader.upload(filePath, { resource_type: 'auto' });
        console.log("Cloudinary Upload Success:", result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error Details:", error);
        throw new Error("Image upload failed");
    }
};

/* ==========================================================================
   PUBLIC CATALOG ENDPOINT (For Frontend)
   ========================================================================== */
router.get('/full-catalog', async (req, res) => {
    try {
        // 1. Get All Categories
        const categories = await Category.find();

        // 2. Build nested structure
        const fullData = await Promise.all(categories.map(async (cat) => {
            const services = await Service.find({ categoryId: cat._id });

            const mappedServices = await Promise.all(services.map(async (srv) => {
                const products = await Product.find({ serviceId: srv._id });

                let serviceObj = {
                    _id: srv._id, // Default to Service ID
                    title: srv.name,
                    slug: srv.slug,
                    image: srv.image,
                    description: srv.description,
                    subcategories: []
                };

                // Logic to map Products back to ServiceData format
                if (products.length > 0) {
                    // Start by mapping all products to subcategories
                    serviceObj.subcategories = products.map(p => ({
                        _id: p._id, // Product ID
                        title: p.name,
                        slug: p.slug,
                        image: p.image,
                        description: p.description,
                        originalPrice: p.originalPrice,
                        discountedPrice: p.discountedPrice,
                        features: p.features
                    }));

                    // If it was a "Single Product Service" (e.g. Letterheads), hoist details to parent
                    // Heuristic: If there is 1 product and its name includes "Standard", or if subcategories was empty in original data
                    // For simplicity: If there's 1 product, hoist its price/features to the service level too, 
                    // so the frontend card displays a price.
                    if (products.length === 1) {
                        const p = products[0];
                        serviceObj._id = p._id; // OVERWRITE with Product ID for Cart
                        serviceObj.originalPrice = p.originalPrice;
                        serviceObj.discountedPrice = p.discountedPrice;
                        serviceObj.features = p.features;
                        // If the product image exists and service doesn't, use product image
                        if (!serviceObj.image && p.image) serviceObj.image = p.image;
                    }
                    // If multiple products, we can take the lowest price as "starting at"?
                    else {
                        const minPrice = Math.min(...products.map(p => p.discountedPrice || 0));
                        serviceObj.discountedPrice = minPrice;
                    }
                }
                return serviceObj;
            }));

            return {
                _id: cat._id,
                category: cat.name,
                categorySlug: cat.slug,
                image: cat.image,
                services: mappedServices
            };
        }));

        res.json(fullData);
    } catch (error) {
        console.error("Full Catalog Error:", error);
        res.status(500).json({ message: error.message });
    }
});

/* ==========================================================================
   CATEGORIES CRUD
   ========================================================================== */

// GET ALL Categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST Category (with Image)
router.post('/categories', upload.single('image'), async (req, res) => {
    try {
        const { name } = req.body;
        let imageUrl = "";

        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.path);
        }

        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const newCategory = new Category({ name, slug, image: imageUrl });
        await newCategory.save();

        res.status(201).json({ message: "Category created", category: newCategory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE Category
router.delete('/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        // Determine whether to cascade delete or not. For now, simple delete.
        res.json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE Category
router.put('/categories/:id', upload.single('image'), async (req, res) => {
    try {
        const { name } = req.body;
        let updateData = { name };

        if (req.file) {
            updateData.image = await uploadToCloudinary(req.file.path);
        }

        if (name) {
            updateData.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        const updated = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


/* ==========================================================================
   SERVICES CRUD
   ========================================================================== */

// GET Services (Optional Filter by Category)
router.get('/services', async (req, res) => {
    try {
        const { categoryId } = req.query;
        let query = {};
        if (categoryId) query.categoryId = categoryId;

        const services = await Service.find(query).populate('categoryId', 'name').sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST Service
router.post('/services', upload.single('image'), async (req, res) => {
    try {
        const { name, categoryId, description } = req.body;
        let imageUrl = "";

        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.path);
        }

        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const newService = new Service({
            name,
            slug,
            categoryId,
            image: imageUrl,
            description
        });
        await newService.save();

        res.status(201).json({ message: "Service created", service: newService });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE Service
router.put('/services/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        let updateData = {};

        if (name) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }
        if (description) updateData.description = description;
        // categoryId is not updated here, assuming it's fixed or handled separately if needed.

        if (req.file) {
            updateData.image = await uploadToCloudinary(req.file.path);
        }

        const updated = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE Service
router.delete('/services/:id', async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: "Service deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


/* ==========================================================================
   PRODUCTS CRUD
   ========================================================================== */

// GET Products (Optional Filter by Service or Search Query)
router.get('/products', async (req, res) => {
    try {
        const { serviceId, search } = req.query;
        let query = {};

        if (serviceId) {
            query.serviceId = serviceId;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query).populate('serviceId', 'name').sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST Product
router.post('/products', upload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
    try {
        // Parse simple fields
        const { name, serviceId, description, originalPrice, discountedPrice, features, video } = req.body;

        // Handle Files
        let mainImageUrl = "";

        // Main Image
        if (req.files['image'] && req.files['image'][0]) {
            mainImageUrl = await uploadToCloudinary(req.files['image'][0].path);
        } else {
            return res.status(400).json({ message: "Main image is required" });
        }

        // Features might come as stringified JSON if coming from FormData array, or comma separated
        let featuresArray = [];
        if (features) {
            // Attempt to parse if it's a JSON string, else split by comma
            try {
                featuresArray = JSON.parse(features);
            } catch (e) {
                featuresArray = features.split(',').map(f => f.trim());
            }
        }

        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const newProduct = new Product({
            name,
            slug,
            serviceId,
            description,
            originalPrice: Number(originalPrice),
            discountedPrice: Number(discountedPrice),
            features: featuresArray,
            image: mainImageUrl,
            video
        });

        await newProduct.save();
        res.status(201).json({ message: "Product created", product: newProduct });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// UPDATE Product
router.put('/products/:id', upload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, description, originalPrice, discountedPrice, features, video } = req.body;
        let updateData = {};

        if (name) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }
        if (description) updateData.description = description;
        if (originalPrice) updateData.originalPrice = Number(originalPrice);
        if (discountedPrice) updateData.discountedPrice = Number(discountedPrice);
        if (video) updateData.video = video;
        // serviceId is not updated here, assuming it's fixed or handled separately if needed.

        // Features
        if (features) {
            try {
                updateData.features = JSON.parse(features);
            } catch (e) {
                updateData.features = features.split(',').map(f => f.trim());
            }
        }

        // Main Image
        if (req.files['image'] && req.files['image'][0]) {
            updateData.image = await uploadToCloudinary(req.files['image'][0].path);
        }

        const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE Product
router.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
