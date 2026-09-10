import mongoose from "mongoose";
import { config } from "./env.js";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  if (!config.mongodbUri) {
    console.warn(
      "[MongoDB] Warning: MONGODB_URI is not defined in environment variables. Database operations will be mocked or unavailable.",
    );
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("[MongoDB] Runtime connection error:", err.message);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(
        "[MongoDB] Disconnected. Reconnection will be attempted automatically.",
      );
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("[MongoDB] Reconnected successfully.");
      isConnected = true;
    });
  } catch (err) {
    console.error(`[MongoDB] Initial connection failure: ${err.message}`);
    // Do not terminate process to ensure /health remains responsive for Render probes
  }
};

export const getDbStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
});
