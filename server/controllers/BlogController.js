import User from "../Schema/User.js";
import Blog from "../Schema/Blog.js";

// Publish Blog
// app.post("/create-blog", userMiddleware, (req, res) => {
export const createBlog = (req, res) => {
	// authenticate user
	let authorId = req.user;
	let { title, banner, tags, desc, content, draft, id } = req.body;

	if (!title.length) {
		return res.status(403).json({ error: "Please provide blog title" });
	}

	// Check if it is draft
	if (!draft) {
		// if (!desc.length || desc.length > 200) {
		// 	return res
		// 		.status(403)
		// 		.json({ error: "Please add caption" });
		// }
		if (!banner.length) {
			return res.status(403).json({ error: "Please provide blog banner" });
		}
		if (!content.blocks.length) {
			return res.status(403).json({ error: "Please provide blog content" });
		}
		// if (!tags.length || tags.length > 5) {
		// 	return res.status(403).json({ error: "Please provide blog tags" });
		// }
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
};

// Blog Page
// app.post("/get-blog", (req, res) => {
export const getBlog = (req, res) => {

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
};

// Home/Latest blogs (upto 5)
// app.post("/latest-blogs", (req, res) => {
export const latestBlog = (req, res) => {

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
};

// Trending blogs
// app.get("/trending-blogs", (req, res) => {
export const trendingBlog = (req, res) => {

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
};

// Tag Filtered blogs
// app.post("/search-blogs", (req, res) => {
export const searchBlog = (req, res) => {

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
};

// pagination for Home/latest blogs
// app.post("/total-latest-blogs", (req, res) => {
export const totalLatestBlogs = (req, res) => {

	Blog.countDocuments({ draft: false })
		.then((count) => {
			return res.status(200).json({ totalDocs: count });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
};

// pagination for trending blogs
// app.post("/total-search-blogs", (req, res) => {
export const totalSearchBlogs = (req, res) => {

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
};
