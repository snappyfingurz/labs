import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
  validateCoupon,
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/validate-coupon", authMiddleware, validateCoupon);
orderRouter.post("/create-payment-order", authMiddleware, createPaymentOrder);
orderRouter.post("/verify-payment", authMiddleware, verifyPayment);
orderRouter.post("/", authMiddleware, createPaymentOrder);
orderRouter.get("/", authMiddleware, getOrders);
orderRouter.get("/:id", authMiddleware, getOrderById);
orderRouter.patch("/:id/status", authMiddleware, updateOrderStatus);

export default orderRouter;
