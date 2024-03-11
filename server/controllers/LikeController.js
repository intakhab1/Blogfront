import Blog from "../Schema/Blog.js";
import Notification from "../Schema/Notification.js";

// Like Blog
// app.post("/like-blog", userMiddleware, (req, res) => {
export const LikeBlog = (req, res) => {

	let user_id = req.user;
	let { _id, isLiked } = req.body;

	let increment = !isLiked ? 1 : -1;

	Blog.findOneAndUpdate(
		{ _id },
		{ $inc: { "activity.total_likes": increment } }
	).then((blog) => {
		if (!isLiked) {
			let like = new Notification({
				type: "like",
				blog: _id,
				notification_for: blog.author,
				user: user_id,
			});
			like.save().then((notification) => {
				return res.status(200).json({ liked_by_user: true });
			});
		} else {
			Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
				.then((result) => {
					res.status(200).json({ liked_by_user: false });
				})
				.catch((err) => {
					res.status(500).json({ error: err.message });
				});
		}
	});
};

//Already liked by user
// app.post("/already-liked-by-user", userMiddleware, (req, res) => {
export const alreadyLikedByUser = (req, res) => {

	let user_id = req.user;
	let { _id } = req.body;

	Notification.exists({ user: user_id, type: "like", blog: _id })
		.then((result) => {
			return res.status(200).json({ result });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
};