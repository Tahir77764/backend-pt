import mongoose from 'mongoose';

const connectMongoDB = async () => {
    const MongoURL = process.env.MONGO_URI;
    await mongoose.connect(MongoURL)
        .then(() => {
            console.log("VT Printz Server has been Connected from MongoDB Atlas Successfully");
        })
        .catch((error) => {
            console.log("Error Connecting to MongoDB Atlas Server \n", error);
            process.exit(1);
        })
}

export default connectMongoDB