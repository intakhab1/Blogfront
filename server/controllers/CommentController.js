import Notification from "../Schema/Notification.js";
import Comment from "../Schema/Comment.js";
import Blog from "../Schema/Blog.js";

// create Comment
// app.post("/add-comment", userMiddleware, (req, res) => {
export const addComment = (req, res) => {

	let userId = req.user;
	let { _id, comment, blog_author, replying_to, notification_id } = req.body;
	if (!comment.length) {
		return res
			.status(403)
			.json({ error: "Please write something to add a comment" });
	}
	// Create comment
	let commentObj = {
		blog_id: _id,
		blog_author,
		comment,
		commented_by: userId,
	};
	if (replying_to) {
		commentObj.parent = replying_to;
		commentObj.isReply = true;
	}

	new Comment(commentObj).save().then(async (commentFile) => {
		let { comment, commentedAt, children } = commentFile;
		Blog.findOneAndUpdate(
			{ _id },
			{
				$push: { comments: commentFile._id },
				$inc: {
					"activity.total_comments": 1,
					"activity.total_parent_comments": replying_to ? 0 : 1,
				},
			}
		).then((blog) => {
			console.log("new comment created");
		});

		// Create a notification
		let notificationObj = {
			type: replying_to ? "reply" : "comment",
			blog: _id,
			notification_for: blog_author,
			user: userId,
			comment: commentFile._id,
		};
		if (replying_to) {
			notificationObj.replied_on_comment = replying_to;
			await Comment.findOneAndUpdate(
				{ _id: replying_to },
				{ $push: { children: commentFile._id } }
			).then((userReplied) => {
				notificationObj.notification_for = userReplied.commented_by;
			});
			if (notification_id) {
				Notification.findOneAndUpdate(
					{ _id: notification_id },
					{ reply: commentFile._id }
				).then((notification) => {
					console.log("Notification updated successfully");
				});
			}
		}
		new Notification(notificationObj).save().then((notification) => {
			console.log("new notification created");
		});

		return res.status(200).json({
			comment,
			commentedAt,
			_id: commentFile._id,
			userId,
			children,
		});
	});
};

// Fetch comments
// app.post("/get-comments", (req, res) => {
export const getComments = (req, res) => {

	let { blog_id, skip } = req.body;
	let maxLimit = 5;

	Comment.find({ blog_id, isReply: false })
		.populate(
			"commented_by",
			"personal_info.username personal_info.profile_img personal_info.fullname"
		)
		.skip(skip)
		.limit(maxLimit)
		.sort({
			commentedAt: -1,
		})
		.then((comment) => {
			return res.status(200).json(comment);
		})
		.catch((err) => {
			console.log(err.message);
			return res.status(500).json({ error: err.message });
		});
};

// Fetch Replies
// app.post("/get-replies", (req, res) => {
export const getReplies = (req, res) => {

	let { _id, skip } = req.body;
	let maxLimit = 5;
	Comment.findOne({ _id })
		.populate({
			path: "children",
			options: {
				limit: maxLimit,
				skip: skip,
				sort: { commentedAt: -1 },
			},
			populate: {
				path: "commented_by",
				select:
					"personal_info.profile_img personal_info.fullname personal_info.username",
			},
			select: "-blog_id -updatedAt",
		})
		.select("children")
		.then((data) => {
			return res.status(200).json({ replies: data.children });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
};

// Delete comment
const deleteCommentFunction = (_id) => {
	Comment.findOneAndDelete({ _id })
		.then((comment) => {
			// delete comment from parent
			if (comment.parent) {
				Comment.findOneAndUpdate(
					{ _id: comment.parent },
					{ $pull: { children: _id } }
				)
					.then((data) => console.log("Comment delete from parent"))
					.catch((err) => console.log(err));
			}
			// delete comment from notification
			Notification.findOneAndDelete({ comment: _id }).then((notification) =>
				console.log("Comment deleted from notification")
			);

			Notification.findOneAndUpdate(
				{ reply: _id },
				{ $unset: { reply: 1 } }
			).then((notification) =>
				console.log("Comment reply deleted from notification")
			);

			// delete comment from comment array of blog
			Blog.findOneAndUpdate(
				{ _id: comment.blog_id },
				{
					$pull: { comments: _id },
					$inc: { "activity.total_comments": -1 },
					"activity.total_parent_comments": comment.parent ? 0 : -1,
				}
			).then((blog) => {
				if (comment.children.length) {
					comment.children.map((replies) => {
						deleteComment(replies);
					});
				}
			});
		})
		.catch((err) => {
			console.log(err.message);
		});
};

// app.post("/delete-comment", userMiddleware, (req, res) => {
export const deleteComment = (req, res) => {

	let user_id = req.user;
	let { _id } = req.body;
	Comment.findOne({ _id }).then((comment) => {
		if (user_id == comment.commented_by || user_id == comment.blog_author) {
			// delete comment
			deleteCommentFunction(_id);
			return res.status(200).json({ status: "Deleted comment" });
		} else {
			return res.status(403).json({ error: "You cannot delete this comment" });
		}
	});
};