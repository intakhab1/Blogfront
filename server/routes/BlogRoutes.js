import express from "express";
const router = express.Router();

import { userMiddleware } from "../middleware/auth.js"
import { createBlog, getBlog, latestBlog, trendingBlog, searchBlog, totalLatestBlogs, totalSearchBlogs } from "../controllers/BlogController.js"

router.post("/create-blog", userMiddleware, createBlog);
router.post("/get-blog", getBlog);
router.post("/latest-blogs", latestBlog);
router.get("/trending-blogs", trendingBlog);
router.post("/search-blogs", searchBlog);
router.post("/total-latest-blogs", totalLatestBlogs);
router.post("/total-search-blogs", totalSearchBlogs);

export default router;

