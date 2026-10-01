
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FoodBridge server running on port ${PORT}`);
});

connectDB().catch((error) => {
  console.error("MongoDB connection unavailable. API is running in limited mode:", error.message);
});
