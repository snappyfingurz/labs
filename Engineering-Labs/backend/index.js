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

dns.setServers(['8.8.8.8', '8.8.4.4']);


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


dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error.message);
  });
app.use(express.json());

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