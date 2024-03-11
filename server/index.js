import express from "express";
const app = express();
import dotenv from "dotenv";
import cors from "cors";
import dbConnection from "./config/database.js";

app.use(cors())

app.use(express.json());
dotenv.config();
const PORT = process.env.PORT || 4000;
dbConnection();

import authRouter from "./routes/user.js"
import blogRouter from "./routes/BlogRoutes.js"
import commentRouter from "./routes/CommentRoutes.js"
import manageBlogRouter from "./routes/ManageBlogRoutes.js"
import imageUploadRouter from "./routes/ImageUploadRouter.js"
import likeRouter from "./routes/LikeRoutes.js"
import notificationRouter from "./routes/NotificationRouter.js"
import profileRouter from "./routes/ProfileRouter.js"

// signup and Login 
app.use("/api/v1", authRouter );
app.use("/api/v1", blogRouter );
app.use("/api/v1", commentRouter);
app.use("/api/v1", manageBlogRouter);
app.use("/api/v1", imageUploadRouter);
app.use("/api/v1", likeRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", profileRouter);

// Default route
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});

app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`);
});
