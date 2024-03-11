import express from "express";
const router = express.Router();

import { userMiddleware } from "../middleware/auth.js"
import { searchProfile, profile, changePassword, changeProfileImg, updateProfile } from "../controllers/ProfileController.js"

router.post("/search-profile", searchProfile);
router.post("/profile", profile);
router.post("/change-password", userMiddleware, changePassword);
router.post("/change-profile-img", userMiddleware, changeProfileImg);
router.post("/update-profile", userMiddleware, updateProfile);

export default router;

