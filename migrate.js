import mongoose from 'mongoose';
import 'dotenv/config'; // Make sure you have dotenv installed
import Category from './models/Category.js';
import Service from './models/Service.js';
import Product from './models/Product.js';
import connectMongoDB from './connect-mongodb.js';

// Simplified Data from ServiceData.js (mapped for logic)
// You can replace this big array with a require/import if you convert ServiceData to JS suitable for Node
const servicesData = [
    {
        category: "Printing Services",
        services: [
            {
                title: "Visiting Cards",
                subcategories: [
                    { title: "Business Cards", price: 500, disc: 350 },
                    { title: "Personalized Cards", price: 600, disc: 450 },
                    { title: "Luxury Cards", price: 800, disc: 650 },
                ]
            },
            { title: "Pamphlets & Posters", subcategories: [{ title: "Flyers", price: 700, disc: 550 }, { title: "Posters", price: 900, disc: 750 }] },
            { title: "Letterheads", price: 400, disc: 300 },
            { title: "Stickers & Labels", price: 300, disc: 200 },
            { title: "Bill Books", price: 600, disc: 450 },
            { title: "Printed Pens", price: 100, disc: 80 },
            { title: "Envelopes", price: 250, disc: 180 },
            { title: "Files / Folders", price: 350, disc: 280 },
            { title: "Garment Tags", price: 150, disc: 120 },
            { title: "Card Holders", price: 200, disc: 150 },
            { title: "Shooting Targets", price: 50, disc: 40 },
        ]
    },
    {
        category: "Marketing Materials",
        services: [
            { title: "Banners", price: 200, disc: 150 },
            { title: "Brochures", price: 250, disc: 190 },
            { title: "Table Top Tent Cards", price: 300, disc: 230 },
            { title: "Custom Roll-Up Standees", price: 350, disc: 270 },
        ]
    },
    {
        category: "Office Items",
        services: [
            { title: "Rubber Stamps", price: 150, disc: 120 },
            { title: "Self-Inked Stamps", price: 180, disc: 145 },
            { title: "Pre-Inked Stamps", price: 210, disc: 170 },
            { title: "Pin Boards", price: 240, disc: 195 },
            { title: "White Boards", price: 270, disc: 220 },
            { title: "Promotional Diaries", price: 300, disc: 245 },
            { title: "Promotional Calendars", price: 330, disc: 270 },
            { title: "Promotional Mugs", price: 360, disc: 295 },
        ]
    },
    {
        category: "Photo Frames",
        services: [
            { title: "Classic Photo Frames", price: 300, disc: 250 },
            { title: "Wall Photo Frames", price: 370, disc: 310 },
            { title: "Canvas Photo Frames", price: 440, disc: 370 },
            { title: "Matte Photo Frames", price: 510, disc: 430 },
            { title: "Personalized Acrylic Photo Frames", price: 580, disc: 490 },
            { title: "Frameless Photo Frames", price: 650, disc: 550 },
        ]
    },
    {
        category: "Invitations & Cards",
        services: [
            { title: "Wedding Invitations", price: 180, disc: 150 },
            { title: "Thank You Cards", price: 200, disc: 165 },
            { title: "Post Cards", price: 220, disc: 180 },
            { title: "Business Invitations", price: 240, disc: 195 },
            { title: "Birthday Invitations", price: 260, disc: 210 },
            { title: "Certificates", price: 280, disc: 225 },
            { title: "Gift Coupon Cards", price: 300, disc: 240 },
            { title: "Vouchers", price: 320, disc: 255 },
            { title: "Rate Cards", price: 340, disc: 270 },
        ]
    },
    {
        category: "Tickets & Event Cards",
        services: [
            { title: "Event Tickets", price: 120, disc: 100 },
            { title: "Raffle Cards", price: 160, disc: 130 },
        ]
    },
    {
        category: "Corporate ID Cards & Accessories",
        services: [
            { title: "ID Cards", price: 90, disc: 70 },
            { title: "Lanyards", price: 100, disc: 78 },
            { title: "Event ID Cards", price: 110, disc: 86 },
            { title: "ID Card Accessories", price: 120, disc: 94 },
        ]
    },
    {
        category: "Packaging Solutions",
        services: [
            { title: "Tote Bags", price: 220, disc: 180 },
            { title: "Jute Bags", price: 270, disc: 220 },
        ]
    }
];

const migrate = async () => {
    await connectMongoDB();

    for (const cat of servicesData) {
        const slug = cat.category.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        // 1. Create Category
        // Check if exists
        let category = await Category.findOne({ slug });
        if (!category) {
            category = await Category.create({ name: cat.category, slug });
            console.log(`Created Category: ${cat.category}`);
        } else {
            console.log(`Category exists: ${cat.category}`);
        }


        for (const srv of cat.services) {
            const srvSlug = srv.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            // 2. Create Service
            let service = await Service.findOne({ slug: srvSlug });
            if (!service) {
                service = await Service.create({
                    name: srv.title,
                    slug: srvSlug,
                    categoryId: category._id,
                    description: `Professional ${srv.title} services.`
                });
                console.log(`  Created Service: ${srv.title}`);
            } else {
                console.log(`  Service exists: ${srv.title}`);
            }

            // 3. Create Product(s)
            // If the service has "subcategories" (like Visiting Cards), treat them as Products
            if (srv.subcategories) {
                for (const prod of srv.subcategories) {
                    const prodSlug = prod.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                    const existingProd = await Product.findOne({ slug: prodSlug });

                    if (!existingProd) {
                        await Product.create({
                            name: prod.title,
                            slug: prodSlug,
                            serviceId: service._id,
                            originalPrice: prod.price,
                            discountedPrice: prod.disc,
                            description: `High quality ${prod.title}`,
                            features: ["Premium Quality", "Custom Design", "Fast Delivery"]
                        });
                        console.log(`    Created Product: ${prod.title}`);
                    }
                }
            }
            // If NO subcategories, the Service itself acts like a single Product bucket
            // We create a generic product with the same name as the service
            else {
                const prodSlug = (srv.title + "-std").toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                const existingProd = await Product.findOne({ slug: prodSlug });

                if (!existingProd) {
                    await Product.create({
                        name: `Standard ${srv.title}`,
                        slug: prodSlug,
                        serviceId: service._id,
                        originalPrice: srv.price,
                        discountedPrice: srv.disc,
                        description: `Standard ${srv.title} package.`,
                        features: ["Standard Options", "Best Value"]
                    });
                    console.log(`    Created Product: Standard ${srv.title}`);
                }
            }
        }
    }
    process.exit();
};

migrate();
