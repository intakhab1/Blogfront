import React, { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { PageAnimation } from "../common/PageAnimation";
import Loader from "../components/Loader";
import { getDate, getFullDay } from "../common/date";
import { BlogEdit } from "../components/BlogEdit";
import BlogPost from "../components/AboutUser";
import { BlogPostCard } from "../components/BlogPostCard";
import { BlogContent } from "../components/BlogContent";
import {
	CommentsContainer,
	fetchComments,
} from "../components/CommentsContainer";

// BlogContext -> to be used in BlogEdit
export const BlogContext = createContext({});

export const blogDataStructure = {
	title: "",
	desc: "",
	content: [],
	author: { personal_info: {} },
	banner: "",
	publishedAt: "",
};

export const BlogPage = () => {
	let { blog_id } = useParams();
	const [blog, setBlog] = useState(blogDataStructure);
	let {
		title,
		content,
		author: {
			personal_info: { fullname, username: author_username, profile_img },
		},
		banner,
		publishedAt,
	} = blog;

	const [similarBlogs, setSimilarBlogs] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isLiked, setIsLiked] = useState(false);
	const [commentsWrapper, setCommentsWrapper] = useState(false);
	const [totalParentComments, setTotalParentComments] = useState(0);

	// fetch current blog data
	const fetchBlogData = () => {
		axios
			.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
			.then(async ({ data: { blog } }) => {
				blog.comments = await fetchComments({
					blog_id: blog._id,
					setParentCommentCount: setTotalParentComments,
				});
				setBlog(blog);
				// console.log(blog);
				// console.log(blog.content);

				// FETCH SIMILAR BLOGS
				axios
					.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
						tag: blog.tags[0],
						limit: 3,
						remove_blog: blog_id,
					})
					.then(({ data }) => {
						setSimilarBlogs(data.blogs);
						// console.log(data.blogs)
					});

				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
				// console.log(err)
			});
	};

	// Reset all state when clicking a similar blog
	const resetStates = () => {
		setBlog(blogDataStructure);
		setSimilarBlogs(null);
		setLoading(true);
		setIsLiked(false);
		setCommentsWrapper(false);
		setTotalParentComments(0);
	};

	useEffect(() => {
		resetStates();
		fetchBlogData();
	}, [blog_id]);

	return (
		<PageAnimation>
			{loading ? (
				<Loader />
			) : (
				<BlogContext.Provider
					value={{
						blog,
						setBlog,
						isLiked,
						setIsLiked,
						commentsWrapper,
						setCommentsWrapper,
						totalParentComments,
						setTotalParentComments,
					}}
				>
					<CommentsContainer />
					<div className="max-w-[900px] center max-lg:px-[5vw] py-10 ">
						<img src={banner} className="aspect-video" />
						<div className="mt-12">
							<h1 className="blog-title">{title}</h1>
							<div className="flex justify-between my-8  ">
								<div className="flex gap-2 items-center mb-7">
									<Link
										to={`/user/${author_username}`}>
										<img src={profile_img} className="w-6 h-6 rounded-full" />
									</Link>
									<Link
										to={`/user/${author_username}`}>
										<p className="line-clamp-1">{fullname} </p>
									</Link>
									<Link
										to={`/user/${author_username}`}
										className="underline line-clamp-1 opacity-50 text-sm ">
										@{author_username}
									</Link>
									<p className="min-w-fit opacity-50 text-sm">
										{getFullDay(publishedAt)}
									</p>
								</div>
							</div>
						</div>

						<BlogEdit />

						<div className="font-gelasio my-12 blog-page-content">
							{content[0]?.blocks?.map((block, i) => {
								return (
									<div className="md:my-8 my-4" key={i}>
										<BlogContent block={block} />
									</div>
								);
							})}
						</div>
						<BlogEdit />
						
						{/* Render Similar blog if any */}
						{similarBlogs != null && similarBlogs.length ? (
							<>
								<h1 className="text-2xl mt-14 mb-10 font-medium">
									Similar Blogs
								</h1>
								{similarBlogs.map((blog, i) => {
									let {
										author: { personal_info },
									} = blog;
									return (
										<PageAnimation
											key={i}
											transition={{ duration: 1, delay: i * 0.08 }}
										>
											<BlogPostCard content={blog} author={personal_info} />
										</PageAnimation>
									);
								})}
							</>
						) : (
							""
						)}
					</div>
				</BlogContext.Provider>
			)}
		</PageAnimation>
	);
};
