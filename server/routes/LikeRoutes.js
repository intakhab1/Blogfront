import express from "express";
const router = express.Router();

import { userMiddleware } from "../middleware/auth.js"
import { LikeBlog, alreadyLikedByUser } from "../controllers/LikeController.js"

router.post("/like-blog", userMiddleware, LikeBlog);
router.post("/already-liked-by-user", userMiddleware, alreadyLikedByUser);

export default router;

