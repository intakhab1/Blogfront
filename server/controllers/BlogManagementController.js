import Notification from "../Schema/Notification.js";
import User from "../Schema/User.js";
import Comment from "../Schema/Comment.js";
import Blog from "../Schema/Blog.js";

// Blog Management
// app.post("/user-written-blogs", userMiddleware, (req, res) => {
export const userWrittenBlogs = (req, res) => {

	let user_id = req.user;
	let { page, draft, query, deletedDocCount } = req.body;
	let maxLimit = 5;
	let skipDocs = (page - 1) * maxLimit;
	if (deletedDocCount) {
		skipDocs -= deletedDocCount;
	}
	Blog.find({ author: user_id, draft, title: new RegExp(query, "i") })
		.skip(skipDocs)
		// .limit(maxLimit)
		.sort({ publishedAt: -1 })
		.select(" title banner publishedAt blog_id activity desc draft -_id")
		.then((blogs) => {
			return res.status(200).json({ blogs });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
};

// app.post("/user-written-blogs-count", userMiddleware, (req, res) => {
export const userWrittenBlogsCount = (req, res) => {

	let user_id = req.user;
	let { draft, query } = req.body;
	Blog.countDocuments({
		author: user_id,
		draft,
		title: new RegExp(query, "i"),
	})
		.then((count) => {
			return res.status(200).json({ totalDocs: count });
		})
		.catch((err) => {
			console.log(err.message);
			return res.status(500).json({ error: err.message });
		});
};

// app.post("/delete-blog", userMiddleware, (req, res) => {
export const deleteBlog = (req, res) => {

	let user_id = req.user;
	let { blog_id } = req.body;

	Blog.findOneAndDelete({ blog_id })
		.then((blog) => {
			Notification.deleteMany({ blog: blog._id }).then((data) => {
				console.log("Notifications deleted successfully");
			});
			Comment.deleteMany({ blog_id: blog._id }).then((data) => {
				console.log("Comments deleted successfull");
			});
			User.findOneAndUpdate(
				{ _id: user_id },
				{ $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } }
			).then((user) => console.log("Blog deleted successfully"));
			return res.status(200).json({ status: "Done" });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
};