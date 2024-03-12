import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/BlogPage";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import axios from "axios";

export const BlogEdit = () => {
	let {
		blog,
		blog: {
			_id,
			title,
			blog_id,
			activity,
			activity: { total_likes, total_comments },
			author: {
				personal_info: { username: author_username },
			},
		},
		setBlog,
		isLiked,
		setIsLiked,
    setCommentsWrapper,
	} = useContext(BlogContext);

	let {
		userAuth: { username, token },
	} = useContext(UserContext);

	useEffect(() => {
		if (token) {
			axios
				.post(
					import.meta.env.VITE_SERVER_DOMAIN + "/already-liked-by-user",
					{ _id },
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)
				.then(({ data: { result } }) => {
          			setIsLiked(Boolean(result))
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, []);

	const handleLike = () => {
		if (token) {
			setIsLiked((preVal) => !preVal);
			!isLiked ? total_likes++ : total_likes--;
			setBlog({ ...blog, activity: { ...activity, total_likes } });
			// like request
			axios
				.post(
					import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
					{
						_id,
						isLiked,
					},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)
				.then(({ data }) => {
					// console.log(data);
				})
				.catch((err) => {
					console.log(err);
				});
		} else {
			toast.error("Please login to like the post");
		}
	};

	return (
		<>
			<Toaster />
			{/* <hr className="border-grey my-2 -mt-4" /> */}
			<div className="flex gap-6 justify-between sm:-mt-4 -mt-6 mb-12 ">

{/* Like button */}
				<div className="flex gap-3 items-center ml-3">
					<button
						onClick={handleLike}
						className={
							"flex items-center gap-2 justify-center rounded-full  " +
								(isLiked ? " text-red" : "")
						}
					>
						<i
							className={"text-xl fi " + (isLiked ? "fi-sr-heart" : "fi-rr-heart")}
						></i>
					</button>
					<p className="text-md text-dark-grey">{total_likes}</p>

{/* Comment button */}
					<button onClick={() => setCommentsWrapper(preVal => !preVal)}
          					className="flex items-center justify-center ">
						<i className="text-xl fi fi-rr-comment-dots"></i>
					</button>
					<p className="text-md text-dark-grey">{total_comments}</p>

				</div>

{/* Twitter */}
				<div className="flex items-center gap-6 mr-3">
					{username === author_username ? (
						<Link
							to={`/editor/${blog_id}`}
							className="hover:text-purple"
						>
							Edit
						</Link>
					) : (
						""
					)}
					<Link
						to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}
					>
						<i className="fi fi-rr-share-square text-xl hover:text-twitter opacity-50"></i>{" "}
					</Link>
				</div>
			</div>

			<hr className="border-grey my-2" />
		</>
	);
};
