import express from "express";
const router = express.Router();

import { login, signup, googleAuth } from "../controllers/Auth.js";

router.post("/signup", signup);
router.post("/login", login);
router.post("/google-auth", googleAuth);

export default router;
