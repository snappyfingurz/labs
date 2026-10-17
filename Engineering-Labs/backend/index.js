import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import dns from 'node:dns';
import cookieParser from "cookie-parser";
import customerRoutes from "./routes/customer.routes.js";
import productsRouter from './routes/product.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';

dotenv.config();

// Custom DNS servers break Vercel / AWS Lambda networking; only set in local dev if needed
if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (e) {
    console.warn("Failed to set custom DNS servers:", e.message);
  }
}

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Serverless-friendly cached MongoDB connection
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is not defined in environment variables on Vercel."
    );
  }

  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once("connected", resolve);
      mongoose.connection.once("error", resolve);
    });
    if (mongoose.connection.readyState === 1) {
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }
  }

  cachedConnection = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("MongoDB connected");
  return cachedConnection;
};

// Health check endpoint to diagnose connection & server status
app.get(["/health", "/api/health"], async (req, res) => {
  let dbStatus = "disconnected";
  try {
    if (mongoose.connection.readyState === 1) {
      dbStatus = "connected";
    } else {
      await connectDB();
      dbStatus = "connected";
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.status(dbStatus === "connected" ? 200 : 503).json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    database: dbStatus,
    readyState: mongoose.connection.readyState,
    vercel: !!process.env.VERCEL,
  });
});

// Ensure database is connected before handling any API request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    return res.status(500).json({
      error: `Database connection error: ${error.message}. Please check MONGODB_URI in Vercel environment variables and ensure MongoDB Atlas allows access from anywhere (0.0.0.0/0).`
    });
  }
});

// Mount routes for both root and /api prefixes to support direct & Vercel rewritten paths
const registerRoutes = (prefix = "") => {
  app.use(`${prefix}/customers`, customerRoutes);
  app.use(`${prefix}/products`, productsRouter);
  app.use(`${prefix}/wishlist`, wishlistRouter);
  app.use(`${prefix}/cart`, cartRouter);
  app.use(`${prefix}/orders`, orderRouter);
};

registerRoutes("");
registerRoutes("/api");

// Only listen directly when running standalone (local dev), not in Vercel serverless execution
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;