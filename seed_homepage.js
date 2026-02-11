import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Service from './models/Service.js';
import Product from './models/Product.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Categories
        const categories = [
            { name: 'Apparel', slug: 'apparel', image: 'https://via.placeholder.com/150' },
            { name: 'Corporate Gifts', slug: 'corporate-gifts', image: 'https://via.placeholder.com/150' },
            { name: 'Printing Services', slug: 'printing-services', image: 'https://via.placeholder.com/150' },
            { name: 'Stationery', slug: 'stationery', image: 'https://via.placeholder.com/150' }
        ];

        const categoryMap = {};

        for (const cat of categories) {
            let category = await Category.findOne({ slug: cat.slug });
            if (!category) {
                category = await Category.create(cat);
                console.log(`Category created: ${cat.name}`);
            } else {
                console.log(`Category exists: ${cat.name}`);
            }
            categoryMap[cat.slug] = category._id;
        }

        // 2. Services
        const services = [
            // Apparel
            { name: 'T-Shirts', slug: 't-shirts', categorySlug: 'apparel', image: 'https://via.placeholder.com/150' },
            { name: 'Caps', slug: 'caps', categorySlug: 'apparel', image: 'https://via.placeholder.com/150' },
            { name: 'Jerseys', slug: 'jerseys', categorySlug: 'apparel', image: 'https://via.placeholder.com/150' },
            { name: 'Hoodies', slug: 'hoodies', categorySlug: 'apparel', image: 'https://via.placeholder.com/150' },
            { name: 'Fabric Printing', slug: 'fabric-printing', categorySlug: 'apparel', image: 'https://via.placeholder.com/150' },

            // Corporate Gifts
            { name: 'Mugs', slug: 'mugs', categorySlug: 'corporate-gifts', image: 'https://via.placeholder.com/150' },
            { name: 'Bottles', slug: 'bottles', categorySlug: 'corporate-gifts', image: 'https://via.placeholder.com/150' },
            { name: 'Keychains', slug: 'keychains', categorySlug: 'corporate-gifts', image: 'https://via.placeholder.com/150' },
            { name: 'Pens', slug: 'pens', categorySlug: 'corporate-gifts', image: 'https://via.placeholder.com/150' },
            { name: 'Badges', slug: 'badges', categorySlug: 'corporate-gifts', image: 'https://via.placeholder.com/150' },
            { name: 'Mobile Accessories', slug: 'mobile-accessories', categorySlug: 'corporate-gifts', image: 'https://via.placeholder.com/150' },
            { name: 'Photo Frames', slug: 'photo-frames', categorySlug: 'corporate-gifts', image: 'https://via.placeholder.com/150' },

            // Printing Services
            { name: 'Visiting Cards', slug: 'visiting-cards', categorySlug: 'printing-services', image: 'https://via.placeholder.com/150' },
            { name: 'Banners & Flex', slug: 'banners-flex', categorySlug: 'printing-services', image: 'https://via.placeholder.com/150' },
            { name: 'Canopy Tents', slug: 'canopy-tents', categorySlug: 'printing-services', image: 'https://via.placeholder.com/150' },
        ];

        const serviceMap = {};

        for (const serv of services) {
            let service = await Service.findOne({ slug: serv.slug });
            if (!service) {
                if (categoryMap[serv.categorySlug]) {
                    service = await Service.create({
                        ...serv,
                        categoryId: categoryMap[serv.categorySlug]
                    });
                    console.log(`Service created: ${serv.name}`);
                } else {
                    console.log(`Skipping service ${serv.name}: Category not found`);
                }
            } else {
                console.log(`Service exists: ${serv.name}`);
            }
            if (service) serviceMap[serv.slug] = service._id;
        }

        // 3. Products
        const products = [
            // T-Shirts
            { name: 'Round Neck T-shirt', slug: 'round-neck-t-shirt', serviceSlug: 't-shirts', originalPrice: 299, discountedPrice: 199, description: 'Premium round-neck custom T-shirt offering soft comfort.', video: '/videos/tshirts.mp4' },
            { name: 'Polo T-shirt Classic', slug: 'polo-t-shirt-classic', serviceSlug: 't-shirts', originalPrice: 499, discountedPrice: 299, description: 'Soft, Breathable, Elegant style.' },
            { name: 'Logo T-Shirts', slug: 'logo-t-shirts', serviceSlug: 't-shirts', originalPrice: 399, discountedPrice: 249, description: 'Custom logo printed t-shirts for branding.', video: '/videos/logo-tshirt.mp4' },

            // Hoodies
            { name: 'Custom Hoodies', slug: 'custom-hoodies', serviceSlug: 'hoodies', originalPrice: 999, discountedPrice: 499, description: 'Cozy, Bold, Stylish, Personalized.' },

            // Caps
            { name: 'Brandy Caps', slug: 'brandy-caps', serviceSlug: 'caps', originalPrice: 199, discountedPrice: 99, description: 'Shade with attitude.' },

            // Jerseys
            { name: 'Custom Jersey', slug: 'custom-jersey', serviceSlug: 'jerseys', originalPrice: 499, discountedPrice: 249, description: 'Athletic, Durable, Personalized.' },

            // Fabric
            { name: 'Custom Fabric Prints', slug: 'custom-fabric-prints', serviceSlug: 'fabric-printing', originalPrice: 1499, discountedPrice: 999, description: 'High quality fabric printing.', video: '/videos/fabric.mp4' },

            // Mugs
            { name: 'Custom Coffee Mugs', slug: 'custom-coffee-mugs', serviceSlug: 'mugs', originalPrice: 199, discountedPrice: 89, description: 'Vintage vibes for modern streets.' },
            { name: 'Printed Mugs', slug: 'printed-mugs', serviceSlug: 'mugs', originalPrice: 199, discountedPrice: 99, description: 'Personalized printed mugs.', video: '/videos/printed-mug.mp4' },

            // Bottles
            { name: 'Custom Water Bottle', slug: 'custom-water-bottle', serviceSlug: 'bottles', originalPrice: 299, discountedPrice: 59, description: 'Cozy, bold, and urban.' },

            // Keychains
            { name: 'Custom Keychains', slug: 'custom-keychains', serviceSlug: 'keychains', originalPrice: 1599, discountedPrice: 999, description: 'Durable custom keychains.', video: '/videos/keychains.mp4' },

            // Pens
            { name: 'Metal Pens', slug: 'metal-pens', serviceSlug: 'pens', originalPrice: 175, discountedPrice: 129, description: 'Premium metal pens with engraving.', video: '/videos/pens.mp4' },

            // Badges
            { name: 'Custom Badges', slug: 'custom-badges', serviceSlug: 'badges', originalPrice: 99, discountedPrice: 49, description: 'Button badges for events.', video: '/videos/badges.mp4' },

            // Mobile Stand
            { name: 'Mobile Stand', slug: 'mobile-stand', serviceSlug: 'mobile-accessories', originalPrice: 299, discountedPrice: 199, description: 'Sturdy mobile stands.', video: '/videos/mobile-stand.mp4' },

            // Frames
            { name: 'Photo Frames', slug: 'photo-frames', serviceSlug: 'photo-frames', originalPrice: 499, discountedPrice: 299, description: 'Elegant photo frames.', video: '/videos/colors.mp4' },

            // Visiting Cards
            { name: 'Visiting Cards', slug: 'visiting-cards-product', serviceSlug: 'visiting-cards', originalPrice: 999, discountedPrice: 599, description: 'Professional visiting cards.', video: '/videos/visiting-card.mp4' },

            // Banners & Flex
            { name: 'Flex & Pamphlet Designs', slug: 'flex-pamphlet-designs', serviceSlug: 'banners-flex', originalPrice: 200, discountedPrice: 129, description: 'Bright sound, bright style.' },

            // Canopy
            { name: 'Custom Canopy Tents', slug: 'custom-canopy-tents', serviceSlug: 'canopy-tents', originalPrice: 10000, discountedPrice: 8000, description: 'Shade with attitude.' },
        ];

        for (const prod of products) {
            let product = await Product.findOne({ slug: prod.slug });
            if (!product) {
                if (serviceMap[prod.serviceSlug]) {
                    product = await Product.create({
                        ...prod,
                        serviceId: serviceMap[prod.serviceSlug],
                        image: prod.image || 'https://via.placeholder.com/300', // Placeholder or use Cloudinary URL if available
                        features: ['High Quality', 'Customizable', 'Fast Delivery']
                    });
                    console.log(`Product created: ${prod.name}`);
                } else {
                    console.log(`Skipping product ${prod.name}: Service not found`);
                }
            } else {
                // UPDATE if fields are missing or different (like video)
                let updated = false;
                if (prod.video && product.video !== prod.video) {
                    product.video = prod.video;
                    updated = true;
                }
                // Also update other possibly missing fields
                if (prod.originalPrice && !product.originalPrice) { product.originalPrice = prod.originalPrice; updated = true; }
                if (prod.discountedPrice && !product.discountedPrice) { product.discountedPrice = prod.discountedPrice; updated = true; }

                if (updated) {
                    await product.save();
                    console.log(`Product updated: ${prod.name}`);
                } else {
                    console.log(`Product exists (no change): ${prod.name}`);
                }
            }
        }

        console.log('Seeding completed!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
