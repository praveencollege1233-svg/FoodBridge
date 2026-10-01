
import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    bufferTimeoutMS: 5000,
  });
  console.log("MongoDB connected successfully");
};

export default connectDB;