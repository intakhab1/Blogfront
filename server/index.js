import express from "express";
const app = express();
import dotenv from "dotenv";
import cors from "cors";
import dbConnection from "./config/database.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid"; // adds random string to username
import jwt from "jsonwebtoken";
// Schema
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";

app.use(
	cors({
		origin: "*",
		// origin:"http://localhost:3000", // frontend
		credentials: true,
	})
);

app.use(express.json());
dotenv.config();
const PORT = process.env.PORT || 4000;
dbConnection();

// google auth
import admin from "firebase-admin";
import serviceAccountKey from "./socialmedia-d41db-firebase-adminsdk-pt12x-eed21b8002.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";
admin.initializeApp({
	credential: admin.credential.cert(serviceAccountKey),
});

// AWS
import aws from "aws-sdk";
const s3 = new aws.S3({
	region: "ap-south-1",
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Upload image to AWS ( unique => uuid-timestamp.jpeg )
const generateUploadURL = async () => {
	const date = new Date();
	const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

	return await s3.getSignedUrlPromise("putObject", {
		Bucket: "socialmediadb",
		Key: imageName,
		Expires: 1000,
		ContentType: "image/jpeg",
	});
};

// AWS image upload url route
app.get("/get-upload-url", (req, res) => {
	generateUploadURL()
		.then((url) => {
			res.status(200).json({ uploadURL: url });
		})
		.catch((err) => {
			console.log(err.message);
			return res.status(500).json({ error: err.message });
		});
});

// Middleware
const userMiddleware = (req, res, next) => {
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

// functions
const generateUniqueUsername = async (email) => {
	let username = email.split("@")[0];
	let isUsernameNotExists = await User.exists({
		"personal_info.username": username,
	}).then((result) => result);
	isUsernameNotExists ? (username += nanoid().substring(0, 4)) : "";
	return username;
};
// Generate token
const formatDataToSend = (user) => {
	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
	// const payload = {
	// 	email: user.personal_info.email,
	// 	id: user._id,
	// };
	// const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
	// 	expiresIn: "168h",
	// });

	return {
		token,
		profile_img: user.personal_info.profile_img,
		username: user.personal_info.username,
		fullname: user.personal_info.fullname,
	};
};

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

// SIGNUP
app.post("/signup", (req, res) => {
	let { fullname, email, password } = req.body;
	// validations
	if (fullname.length < 3) {
		return res.status(403).json({
			success: false,
			error: "Fullname must have at least 3 letters",
		});
	}
	if (!email.length) {
		return res.status(403).json({
			success: false,
			error: "Please provide email",
		});
	}
	if (!emailRegex.test(email)) {
		return res.status(403).json({
			success: false,
			error: "Invalid email",
		});
	}
	if (!passwordRegex.test(password)) {
		return res.status(403).json({
			success: false,
			error:
				"Password should be 6 to 20 characters long having at least a numeric, lowercase and uppercase letter",
		});
	}

	bcrypt.hash(password, 10, async (err, hashed_password) => {
		let username = await generateUniqueUsername(email);
		let user = new User({
			personal_info: { fullname, email, password: hashed_password, username },
		});
		user
			.save()
			.then((u) => {
				return res.status(200).json(formatDataToSend(u));
			})
			.catch((err) => {
				if (err.code == 11000) {
					return res.status(500).json({ error: "Email already exists" });
				}
				return res.status(500).json({
					success: false,
					error: err.message,
				});
			});
	});
});
// LOGIN
app.post("/login", (req, res) => {
	let { email, password } = req.body;

	User.findOne({ "personal_info.email": email })
		.then((user) => {
			if (!user) {
				return res.status(403).json({
					error: "Email is not Registered, please Sign up to Continue`",
				});
			}
			// google auth
			if (!user.google_auth) {
				// compare with existing password
				bcrypt.compare(
					password,
					user.personal_info.password,
					(err, passwordCheck) => {
						if (err) {
							return res.status(403).json({
								success: false,
								error: "Error occured while logging, please try again",
							});
						}
						if (!passwordCheck) {
							return res.status(403).json({
								success: false,
								error: "Incorrect password",
							});
						} else {
							return res.status(200).json(formatDataToSend(user));
						}
					}
				);
			} else {
				return res.status(403).json({
					success: false,
					error:
						"This account was created using google, please try logging in with google",
				});
			}
		})
		.catch((err) => {
			console.log(err.message);
			return res.status(500).json({ error: err.message });
		});
});
// GOOGLE AUTH
app.post("/google-auth", async (req, res) => {
	let { token } = req.body;
	getAuth()
		.verifyIdToken(token)
		.then(async (goggleUser) => {
			let { email, name, picture } = goggleUser;
			picture = picture.replace("s96-c", "s384-c"); // increasing img resolution

			// check if username exists in db if yes then login else sign up
			let user = await User.findOne({ "personal_info.email": email })
				.select(
					"personal_info.fullname personal_info.username personal_info.profile_img google_auth"
				)
				.then((u) => {
					return u || null;
				})
				.catch((error) => {
					return res.status(500).json({ error: error.message });
				});

			// Already sign up without google
			if (user) {
				if (!user.google_auth) {
					return res.status(403).json({
						error:
							"This account was created without google, please try log in using email and password",
					});
				}
			} else {
				// sign up using google
				let username = await generateUniqueUsername(email);
				user = new User({
					personal_info: {
						fullname: name,
						email,
						profile_img: picture,
						username,
					},
					google_auth: true,
				});
				await user
					.save()
					.then((u) => {
						user = u;
					})
					.catch((err) => {
						return res.status(500).json({ error: err.message });
					});
			}
			return res.status(200).json(formatDataToSend(user));
		})
		.catch((err) => {
			return res
				.status(500)
				.json({ error: "Authentication falied, please try again." });
		});
});

// Publish Blog
app.post("/create-blog", userMiddleware, (req, res) => {
	// authenticate user
	let authorId = req.user;
	let { title, banner, tags, desc, content, draft, id } = req.body;

	if (!title.length) {
		return res.status(403).json({ error: "Please provide blog title" });
	}

	// Check if it is draft
	if (!draft) {
		if (!desc.length || desc.length > 200) {
			return res
				.status(403)
				.json({ error: "Please provide blog description under 200 character" });
		}
		if (!banner.length) {
			return res.status(403).json({ error: "Please provide blog banner" });
		}
		if (!content.blocks.length) {
			return res.status(403).json({ error: "Please provide blog content" });
		}
		if (!tags.length || tags.length > 5) {
			return res.status(403).json({ error: "Please provide blog tags" });
		}
	}

	tags = tags.map((tag) => tag.toLowerCase());
	// create unique blog id
	let blog_id =
		id ||
		title
			.replace(/[^a-zA-z0-9]/g, " ")
			.replace(/\s+/g, "-")
			.trim() + nanoid(); // replacing special chars with -
	// check if this blog is edited using id if ,
	// it is currently edited then find this blog with id and update it
	if (id) {
		Blog.findOneAndUpdate(
			{ blog_id },
			{
				title,
				desc,
				banner,
				content,
				tags,
				draft: draft ? draft : false,
			}
		)
			.then(() => {
				return res.status(200).json({ id: blog_id });
			})
			.catch((err) => {
				return res.status(500).json({ error: err.message });
			});
	} else {
		// create blog
		let blog = new Blog({
			title,
			desc,
			banner,
			content,
			tags,
			author: authorId,
			blog_id,
			draft: Boolean(draft),
		});
		// save blog in db
		blog
			.save()
			.then((blog) => {
				let incrementPostVal = draft ? 0 : 1;
				User.findOneAndUpdate(
					{ _id: authorId },
					{
						$inc: { "account_info.total_posts": incrementPostVal },
						$push: { blogs: blog._id },
					}
				)
					.then((user) => {
						return res.status(200).json({ id: blog.blog_id });
					})
					.catch((err) => {
						return res.status(500).json({ error: "Failed to update post" });
					});
			})
			.catch((err) => {
				return res.status(500).json({ error: err.message });
			});
	}
});

// Home/Latest blogs (upto 5)
app.post("/latest-blogs", (req, res) => {
	let { page } = req.body;

	let maxLimit = 10;

	Blog.find({ draft: false })
		.populate(
			"author",
			"personal_info.profile_img personal_info.username personal_info.fullname -_id"
		)
		.sort({ publishedAt: -1 })
		.select("blog_id title desc banner activity tags publishedAt -_id")
		.skip((page - 1) * maxLimit)
		.limit(maxLimit)
		.then((blogs) => {
			return res.status(200).json({ blogs });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

// Trending blogs
app.get("/trending-blogs", (req, res) => {
	Blog.find({ draft: false })
		.populate(
			"author",
			"personal_info.profile_img personal_info.username personal_info.fullname -_id"
		)
		.sort({
			"activity.total_reads": -1,
			"activity.total_likes": -1,
			publishedAt: -1,
		})
		.select("blog_id title banner desc activity tags publishedAt -_id ")
		// .limit(5)
		.then((blogs) => {
			return res.status(200).json({ blogs });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

// Tag Filtered blogs
app.post("/search-blogs", (req, res) => {
	let { tag, page, query, author, limit, remove_blog } = req.body;

	let findQuery;
	if (tag) {
		findQuery = { tags: tag, draft: false, blog_id: { $ne: remove_blog } };
	} else if (query) {
		findQuery = { draft: false, title: new RegExp(query, "i") };
	} else if (author) {
		findQuery = { author, draft: false };
	}

	let maxLimit = limit ? limit : 5;

	Blog.find(findQuery)
		.populate(
			"author",
			"personal_info.profile_img personal_info.username personal_info.fullname -_id"
		)
		.sort({ publishedAt: -1 })
		.select("blog_id title desc banner activity tags publishedAt -_id")
		.skip((page - 1) * maxLimit)
		.limit(maxLimit)
		.then((blogs) => {
			return res.status(200).json({ blogs });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

// pagination for Home/latest blogs
app.post("/total-latest-blogs", (req, res) => {
	Blog.countDocuments({ draft: false })
		.then((count) => {
			return res.status(200).json({ totalDocs: count });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

// pagination for trending blogs
app.post("/total-search-blogs", (req, res) => {
	let { tag, query, author } = req.body;

	let findQuery;
	if (tag) {
		findQuery = { tags: tag, draft: false };
	} else if (query) {
		findQuery = { draft: false, title: new RegExp(query, "i") };
	} else if (author) {
		findQuery = { author, draft: false };
	}

	Blog.countDocuments(findQuery)
		.then((count) => {
			return res.status(200).json({ totalDocs: count });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

// SEARCH for profile
app.post("/search-profile", (req, res) => {
	let { query } = req.body;

	User.find({ "personal_info.username": new RegExp(query, "i") })
		.limit(20)
		.select(
			"personal_info.fullname personal_info.username personal_info.profile_img -_id"
		)
		.then((users) => {
			return res.status(200).json({ users });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

// PROFLE
app.post("/profile", (req, res) => {
	let { username } = req.body;
	User.findOne({ "personal_info.username": username })
		.select("-personal_info.password -google_auth -updatedAt -blogs ")
		.then((user) => {
			return res.status(200).json(user);
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

// Blog Page
app.post("/get-blog", (req, res) => {
	let { blog_id, draft, mode } = req.body;

	let increment = mode != "edit" ? 1 : 0;

	// increase read count for the blog
	Blog.findOneAndUpdate(
		{ blog_id },
		{ $inc: { "activity.total_reads": increment } }
	)
		.populate(
			"author",
			"personal_info.fullname personal_info.username personal_info.profile_img "
		)
		.select("title desc content banner activity publishedAt tags blog_id ")
		.then((blog) => {
			// increase read count for the user
			User.findOneAndUpdate(
				{ "personal_info.username": blog.author.personal_info.username },
				{ $inc: { "account_info.total_reads": increment } }
			).catch((err) => {
				return res.status(500).json({ error: err.message });
			});
			if (blog.draft && !draft) {
				return res.status(500).json({ error: "Cannot access draft blogs" });
			}
			return res.status(200).json({ blog });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

// Like Blog
app.post("/like-blog", userMiddleware, (req, res) => {
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
});

//Already liked by user
app.post("/already-liked-by-user", userMiddleware, (req, res) => {
	let user_id = req.user;
	let { _id } = req.body;

	Notification.exists({ user: user_id, type: "like", blog: _id })
		.then((result) => {
			return res.status(200).json({ result });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

// create Comment
app.post("/add-comment", userMiddleware, (req, res) => {
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
});

// Fetch comments
app.post("/get-comments", (req, res) => {
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
});

// Fetch Replies
app.post("/get-replies", (req, res) => {
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
});

// Delete comment
const deleteComment = (_id) => {
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

app.post("/delete-comment", userMiddleware, (req, res) => {
	let user_id = req.user;
	let { _id } = req.body;
	Comment.findOne({ _id }).then((comment) => {
		if (user_id == comment.commented_by || user_id == comment.blog_author) {
			// delete comment
			deleteComment(_id);
			return res.status(200).json({ status: "Deleted comment" });
		} else {
			return res.status(403).json({ error: "You cannot delete this comment" });
		}
	});
});

// Change Password
app.post("/change-password", userMiddleware, (req, res) => {
	let { currentPassword, newPassword } = req.body;

	if (
		!passwordRegex.test(currentPassword) ||
		!passwordRegex.test(newPassword)
	) {
		return res.status(403).json({
			error:
				"Password should be 6 to 20 characters long with atleast 1 numeric, 1 lowercase and 1 uppercase letter",
		});
	}
	User.findOne({ _id: req.user })
		.then((user) => {
			if (user.google_auth) {
				return res.status(403).json({
					error:
						"Cannot change password because this account was created using google authentication",
				});
			}
			bcrypt.compare(
				currentPassword,
				user.personal_info.password,
				(err, result) => {
					if (err) {
						return res.status(500).json({
							error:
								"Error coccured while compairing passwords, please try again",
						});
					}
					if (!result) {
						return res
							.status(403)
							.json({ error: "Current password is incorrect" });
					}
					bcrypt.hash(newPassword, 10, (err, hashed_password) => {
						User.findOneAndUpdate(
							{ _id: req.user },
							{ "personal_info.password": hashed_password }
						)
							.then((u) => {
								return res
									.status(200)
									.json({ status: "Password changed successfully" });
							})
							.catch((err) => {
								return res.status(500).json({
									error:
										"Error occured while saving new password, please try again",
								});
							});
					});
				}
			);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: "User not found while updating password" });
		});
});

// Change Profile Image
app.post("/change-profile-img", userMiddleware, (req, res) => {
	let { url } = req.body;
	User.findOneAndUpdate({ _id: req.user }, { "personal_info.profile_img": url })
		.then(() => {
			return res.status(200).json({ profile_img: url });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

// Change Username , Bio and Links
app.post("/update-profile", userMiddleware, (req, res) => {
	let { username, bio, social_links } = req.body;
	let bioLimit = 150;

	if (username.length < 3) {
		return res
			.status(403)
			.json({ error: "Username should at least have 3 characters" });
	}
	if (bio.length > bioLimit) {
		return res
			.status(403)
			.json({ error: `Bio should be less than ${bioLimit} characters` });
	}

	let socialLinkArray = Object.keys(social_links);
	try {
		for (let i = 0; i < socialLinkArray.length; i++) {
			if (social_links[socialLinkArray[i]].length) {
				let hostname = new URL(social_links[socialLinkArray[i]]).hostname;
				// hostname = https://github.com
				if (
					!hostname.includes(`${socialLinkArray[i]}.com`) &&
					socialLinkArray[i] != "website"
				) {
					return res
						.status(403)
						.json({ error: `Invalid ${socialLinkArray[i]} link.` });
				}
			}
		}
	} catch (err) {
		return res.status(500).json({
			error: "Please provide valid social links, starting with https",
		});
	}
	// create new entry in DB
	let updatedObj = {
		"personal_info.username": username,
		"personal_info.bio": bio,
		social_links,
	};
	User.findOneAndUpdate({ _id: req.user }, updatedObj, {
		runValidators: true,
	})
		.then(() => {
			return res.status(200).json({ username });
		})
		.catch((err) => {
			if (err.code == 11000) {
				return res.status(409).json({
					error: "Username is already taken, try using different username",
				});
			}
			return res.status(500).json({ error: err.message });
		});
});

// New Notification
app.get("/new-notification", userMiddleware, (req, res) => {
	let user_id = req.user;

	Notification.exists({
		notification_for: user_id,
		seen: false,
		user: { $ne: user_id },
	})
		.then((result) => {
			if (result) {
				return res.status(200).json({ new_notification: true });
			} else {
				return res.status(200).json({ new_notification: false });
			}
		})
		.catch((err) => {
			console.log(err.message);
			return res.status(500).json({ error: err.message });
		});
});

// Notifications filter (all, like, comment, reply)
app.post("/notifications", userMiddleware, (req, res) => {
	let user_id = req.user;

	let { page, filter, deletedNotificationCount } = req.body;

	let maxLimit = 5;

	let findQuery = { notification_for: user_id, user: { $ne: user_id } };

	let skipDocs = (page - 1) * maxLimit;

	if (filter != "all") {
		findQuery.type = filter;
	}
	if (deletedNotificationCount) {
		skipDocs -= deletedNotificationCount;
	}
	Notification.find(findQuery)
		.skip(skipDocs)
		.limit(maxLimit)
		.populate("blog", "title blog_id")
		.populate(
			"user",
			"personal_info.fullname personal_info.username personal_info.profile_img"
		)
		.populate("comment", "comment")
		.populate("replied_on_comment", "comment")
		.populate("reply", "comment")
		.sort({ createdAt: -1 })
		.select("createdAt type seen reply")
		.then((notifications) => {
			Notification.updateMany(findQuery, { seen: true })
				.skip(skipDocs)
				.limit(maxLimit)
				.then(() => console.log("Notification seen"));
			return res.status(200).json({ notifications });
		})
		.catch((err) => {
			console.log(err.message);
			return res.status(500).json({ error: err.message });
		});
});

// Total number of notifications
app.post("/total-notifications-count", userMiddleware, (req, res) => {
	let user_id = req.user;
	let { filter } = req.body;
	let findQuery = { notification_for: user_id, user: { $ne: user_id } };

	if (filter != "all") {
		findQuery.type = filter;
	}
	Notification.countDocuments(findQuery)
		.then((count) => {
			return res.status(200).json({ totalDocs: count });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

// Blog Management
app.post("/user-written-blogs", userMiddleware, (req, res) => {
	let user_id = req.user;
	let { page, draft, query, deletedDocCount } = req.body;
	let maxLimit = 5;
	let skipDocs = (page - 1) * maxLimit;
	if (deletedDocCount) {
		skipDocs -= deletedDocCount;
	}
	Blog.find({ author: user_id, draft, title: new RegExp(query, "i") })
		.skip(skipDocs)
		.limit(maxLimit)
		.sort({ publishedAt: -1 })
		.select(" title banner publishedAt blog_id activity desc draft -_id")
		.then((blogs) => {
			return res.status(200).json({ blogs });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
});

app.post("/user-written-blogs-count", userMiddleware, (req, res) => {
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
});

app.post("/delete-blog", userMiddleware, (req, res) => {
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
});

// Default server for testing
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});

app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`);
});
