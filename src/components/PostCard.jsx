import React, { useContext } from "react";
import { UserContext } from "../App";
import { Link } from "react-router-dom";
import { getFullDay } from "../common/date";

export const PostCard = ({ blog, index }) => {
	let {
		title,
		blog_id,
		author: {
		personal_info: { fullname, username: author_username , profile_img },
		},
		publishedAt,
		banner,
		desc,
		activity,
		activity: { total_likes, total_comments },
	} = blog;

		let {
		userAuth: { username, token },
		} = useContext(UserContext);


  return (
		<div className="w-full gap-8 mb-8 items-center border-b border-grey pb-5 ">
			<div className="flex gap-2 items-center mb-7">
				<Link
					to={`/user/${author_username}`}>
					<img src={profile_img} className="w-8 h-8 rounded-full" />
				</Link>
				<Link
					to={`/user/${author_username}`}>
					<p className="line-clamp-1">{fullname} </p>
				</Link>
				<Link
					to={`/user/${author_username}`}>
					<p className="line-clamp-1 opacity-50 text-sm ">@{author_username}</p>
				</Link>
				<p className="min-w-fit opacity-50 text-sm">{getFullDay(publishedAt)}</p>
			</div>
			<h1 className="blog-title -mt-4">{title}</h1>

			<div className="w-full h-64 bg-grey aspect-square ">
				<Link to={`/blog/${blog_id}`}>
				<img
					src={banner}
					className="mt-4 w-full h-full a object-cover aspect-square"
				/>
				</Link>
			</div>
			<p className="mt-4 my-3 text-xl font-gelasio leading-7 md:max-[1100px]:hidden line-clamp-2  ">{desc}</p>
			
			<div className="flex gap-6 ml-3 justify-between mt-4 mb-6">

				<div className="flex gap-6 items-center ">
					<div className="flex gap-6 items-center ">
						<div className="flex gap-2 items-center">
							<button 
								className="flex items-center gap-2 justify-center  " 
							>
								<i className="text-xl fi-rr-heart"></i>
							</button>
							<p className="text-md text-dark-grey">{total_likes}</p>
						</div>

						<div className="flex gap-2 items-center">
							<button 
									className="flex items-center gap-2 justify-center ">
								<i className="text-xl fi fi-rr-comment-dots"></i>
							</button>
							<p className="text-md text-dark-grey">{total_comments}</p>
						</div>
						
					</div>
				</div>

				<div className="flex items-center gap-6 mr-3">
					{username === author_username ? (
						<Link to={`/editor/${blog_id}`}
							className="hover:text-purple">
							Edit
						</Link>
					) : (
						""
					)}
					<Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}>
						<i className="fi fi-rr-share-square opacity-50 text-xl hover:opacity-100 hover:text-twitter"></i>{" "}
					</Link>
				</div>
			</div>
		</div>
	);
};








// import React, { useState, useContext, useEffect, createContext } from "react";
// import { Link } from "react-router-dom";
// import { getFullDay } from "../common/date";
// import { BlogEdit } from "./BlogEdit";
// import { BlogContext } from "../pages/BlogPage";
// import { UserContext } from "../App";
// import axios from "axios";
// import { HomeBlogEdit } from "./HomeBlogEdit";

// export const currentBlogContext = createContext({});

// export const currentBlogDataStructure = {
// 	title: "",
// 	desc: "",
// 	content: [],
// 	author: { personal_info: {} },
// 	banner: "",
// 	publishedAt: "",
// };

// export const PostCard = ({ blog, index }) => {
// 	const [currentBlog, setCurrentBlog] = useState(currentBlogDataStructure);
// 	let {
// 		title,
// 		blog_id,
// 		author: {
// 		personal_info: { fullname, username: author_username , profile_img },
// 		},
// 		publishedAt,
// 		banner,
// 		desc,
// 		activity,
// 		activity: { total_likes, total_comments },
// 	} = blog;

// 	const [loading, setLoading] = useState(true);
// 	const [isLiked, setIsLiked] = useState(false);
// 	const [commentsWrapper, setCommentsWrapper] = useState(false);
// 	const [totalParentComments, setTotalParentComments] = useState(0);

// 	let {
// 		userAuth: { username, token },
// 		} = useContext(UserContext);

// 	const handleLike = () => {
// 		if (token) {
// 			console.log("liked")
// 			console.log(blog_id)
// 			console.log(_id)
// 			setIsLiked((preVal) => !preVal);

// 			!isLiked ? total_likes++ : total_likes--;
// 			console.log(isLiked);
// 			console.log(_id)
// 			setBlog({ ...blog, activity: { ...activity, total_likes } });

// 			// like request
// 			axios
// 				.post(
// 					import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
// 					{
// 						_id,
// 						isLiked,
// 					},
// 					{
// 						headers: {
// 							Authorization: `Bearer ${token}`,
// 						},
// 					}
// 				)
// 				.then(({ data }) => {
// 					// console.log(data);
// 				})
// 				.catch((err) => {
// 					console.log(err);
// 				});
// 		} else {
// 			toast.error("Please login to like the post");
// 		}
// 	};

// 	const fetchBlogData = () => {
// 		axios
// 			.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
// 			.then(async ({ data: { blog } }) => {
// 				blog.comments = await fetchComments({
// 					blog_id: blog._id,
// 					setParentCommentCount: setTotalParentComments,
// 				});
// 				setCurrentBlog(blog);
// 				// console.log(blog);
// 				console.log(blog._id);

// 				setLoading(false);
// 			})
// 			.catch((err) => {
// 				setLoading(false);
// 				// console.log(err)
// 			});
// 	};
// 	// Reset all state when clicking a similar blog
// 	const resetStates = () => {
// 		setCurrentBlog(currentBlogDataStructure);
// 		setLoading(true);
// 		setIsLiked(false);
// 		setCommentsWrapper(false);
// 		setTotalParentComments(0);
// 	};

// 	useEffect(() => {
// 		resetStates();
// 		fetchBlogData();
// 	}, [blog_id]);

//   return (
// 		<currentBlogContext.Provider
// 			value={{
// 				currentBlog,
// 				setCurrentBlog,
// 				isLiked,
// 				setIsLiked,
// 				commentsWrapper,
// 				setCommentsWrapper,
// 				totalParentComments,
// 				setTotalParentComments,
// 			}}
// 		>
// 		<div className="w-full gap-8 mb-8 items-center border-b border-grey pb-5 ">
// 			<div className="flex gap-2 items-center mb-7">
// 				<Link
// 					to={`/user/${author_username}`}>
// 					<img src={profile_img} className="w-8 h-8 rounded-full" />
// 				</Link>
// 				<Link
// 					to={`/user/${author_username}`}>
// 					<p className="line-clamp-1">{fullname} </p>
// 				</Link>
// 				<Link
// 					to={`/user/${author_username}`}>
// 					<p className="line-clamp-1 opacity-50 text-sm ">@{author_username}</p>
// 				</Link>
// 				<p className="min-w-fit opacity-50 text-sm">{getFullDay(publishedAt)}</p>
// 			</div>
// 			<h1 className="blog-title -mt-4">{title}</h1>

// 			<div className="w-full h-64 bg-grey aspect-square ">
// 				<Link to={`/blog/${blog_id}`}>
// 				<img
// 					src={banner}
// 					className="mt-4 w-full h-full a object-cover aspect-square"
// 				/>
// 				</Link>
// 			</div>
// 			<p className="mt-4 my-3 text-xl font-gelasio leading-7 md:max-[1100px]:hidden line-clamp-2  ">{desc}</p>
// 			<HomeBlogEdit/>
// 			{/* 
// 			<div className="flex gap-6 ml-3  justify-between mt-4 mb-6">
// 				<div className="flex gap-6 items-center ">
// 					<div className="flex gap-6 items-center ">
// 						<div className="flex gap-2 items-center">
// 							<button onClick={handleLike}
// 								className={
// 									"flex items-center gap-2 justify-center  " +
// 									(isLiked ? " text-red" : "")
// 								}
// 							>
// 								<i className={"text-xl fi " + (isLiked ? "fi-sr-heart" : "fi-rr-heart")}></i>
// 							</button>
// 							<p className="text-md text-dark-grey">{total_likes}</p>
// 						</div>
// 						<div className="flex gap-2 items-center">
// 							<button onClick={() => setCommentsWrapper(preVal => !preVal)}
// 									className="flex items-center gap-2 justify-center ">
// 								<i className="text-xl fi fi-rr-comment-dots"></i>
// 							</button>
// 							<p className="text-md text-dark-grey">{total_comments}</p>
// 						</div>
// 					</div>
// 				</div>
// 				<div className="flex items-center gap-6 mr-3">
// 					{username === author_username ? (
// 						<Link to={`/editor/${blog_id}`}
// 							className="underline hover:text-purple">
// 							Edit
// 						</Link>
// 					) : (
// 						""
// 					)}
// 					<Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}>
// 						<i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>{" "}
// 					</Link>
// 				</div>
// 			</div>
// 			 */}

// 		</div>

// 		</currentBlogContext.Provider>
// 	);
// };



