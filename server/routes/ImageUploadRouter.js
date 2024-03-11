import express from "express";
const router = express.Router();

import { getUploadUrl } from "../controllers/ImageUploadAWSController.js"

router.get("/get-upload-url", getUploadUrl );

export default router;

