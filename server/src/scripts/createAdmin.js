import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGO_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in server/.env");
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 12) {
  console.error("ADMIN_PASSWORD must contain at least 12 characters");
  process.exit(1);
}

try {
  await mongoose.connect(MONGO_URI);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  if (await User.exists({ email })) throw new Error("An account with ADMIN_EMAIL already exists");

  await User.create({
    name: ADMIN_NAME.trim(),
    email,
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role: "admin",
    verificationStatus: "verified",
  });
  console.log(`Admin account created for ${email}`);
} catch (error) {
  console.error(`Admin bootstrap failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}