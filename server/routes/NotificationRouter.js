import express from "express";
const router = express.Router();

import { userMiddleware } from "../middleware/auth.js"
import { newNotification, notifications, totalNotificationsCount } from "../controllers/NotificationsController.js"

router.get("/new-notification", userMiddleware, newNotification);
router.post("/notifications", userMiddleware, notifications);
router.post("/total-notifications-count", userMiddleware, totalNotificationsCount);


export default router;

