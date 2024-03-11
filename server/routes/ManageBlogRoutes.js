import express from "express";
const router = express.Router();

import { userMiddleware } from "../middleware/auth.js"
import { userWrittenBlogs, userWrittenBlogsCount, deleteBlog } from "../controllers/BlogManagementController.js"

router.post("/user-written-blogs", userMiddleware, userWrittenBlogs);
router.post("/user-written-blogs-count", userMiddleware, userWrittenBlogsCount);
router.post("/delete-blog", userMiddleware, deleteBlog);

export default router;

