import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";
import connectDB from "./connect-mongodb.js";
import bcrypt from "bcryptjs";

dotenv.config();

const seedAdmins = async () => {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admins = [
      { email: "admin1@gmail.com", password: hashedPassword },
      { email: "admin2@gmail.com", password: hashedPassword },
      { email: "admin3@gmail.com", password: hashedPassword },
    ];

    await Admin.deleteMany();

    await Admin.insertMany(admins);

    console.log("Admins seeded ✅");
    process.exit();
  } catch (error) {
    console.error("Error seeding admins:", error);
    process.exit(1);
  }
};

seedAdmins();
