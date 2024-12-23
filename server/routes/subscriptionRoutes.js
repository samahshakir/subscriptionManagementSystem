import express from "express";
import protect from "../middlewares/auth.js"; // Change this line
import { upload } from "../middlewares/multer.js";
import {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  updateSubscriptionStatus,
  deleteSubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.post("/", protect, upload.single("invoice"), createSubscription);
router.get("/", protect, getSubscriptions);
router.get("/:id", protect, getSubscriptionById);
router.put("/:id", protect, upload.single("invoice"), updateSubscription);
router.put("/:id/status", protect, updateSubscriptionStatus);
router.delete("/:id", protect, deleteSubscription);

export default router;
