
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:5173", "http://127.0.0.1:5173"];
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  })
);

app.get("/api/health", (req, res) => {
  const databaseState = ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown";
  const available = mongoose.connection.readyState === 1;
  res.status(available ? 200 : 503).json({
    success: available,
    message: available ? "FoodBridge API and database are ready" : "FoodBridge cannot reach MongoDB Atlas",
    database: databaseState,
  });
});

app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "FoodBridge cannot reach MongoDB Atlas. Check the cluster Network Access allowlist and try again.",
      database: "disconnected",
    });
  }

  return next();
});

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorMiddleware);

export default app;