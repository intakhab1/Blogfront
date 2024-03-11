import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

// Middleware
export const userMiddleware = (req, res, next) => {
	const userHeader = req.header("authorization");
	const token = userHeader && userHeader.split(" ")[1];
	if (token === null) {
		return res.status(401).json({ error: "No token found" });
	}
	jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
		if (err) {
			return res.status(403).json({ error: "Invalid token" });
		}
		req.user = user.id;
		next();
	});
};