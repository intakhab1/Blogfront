import express from "express";
const router = express.Router();

import { userMiddleware } from "../middleware/auth.js"
import { addComment, getComments, getReplies, deleteComment } from "../controllers/CommentController.js"

router.post("/add-comment", userMiddleware, addComment);
router.post("/get-comments", getComments);
router.post("/get-replies", getReplies);
router.post("/delete-comment", userMiddleware, deleteComment);

export default router;

