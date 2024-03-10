import React, { useContext } from "react";
import { BlogContext } from "../pages/BlogPage";
import { CommentField } from "../components/CommentField";
import axios from "axios";
import { NoData } from "./NoData";
import { PageAnimation } from "../common/PageAnimation";
import { CommentCard } from "./CommentCard";
import { LoadMore } from "./LoadMore";

export const fetchComments = async ({
	blog_id,
	setParentCommentCount,
	skip = 0,
	comment_array = null,
}) => {
	let res;
	await axios
		.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-comments", {
			blog_id,
			skip,
		})
		.then(({ data }) => {
			data.map((comment) => {
				comment.childrenLevel = 0;
			});
			setParentCommentCount((preVal) => preVal + data.length);
			if (comment_array == null) {
				res = { results: data };
			} else {
				res = { results: [...comment_array, ...data] };
			}
		});
	return res;
};
export const CommentsContainer = () => {
	let {
		blog,
		blog: {
			_id,
			title,
			comments: { results: commentsArray },
			activity: { total_parent_comments },
		},
		setBlog,
		commentsWrapper,
		setCommentsWrapper,
		totalParentComments,
		setTotalParentComments,
	} = useContext(BlogContext);

	// Load more button
	const LoadMoreComments = async () => {
		let newCommentArray = await fetchComments({
			skip: totalParentComments,
			blog_id: _id,
			setParentCommentCount: setTotalParentComments,
			comment_array: commentsArray,
		});
		setBlog({ ...blog, comments: newCommentArray });
	};

	return (
		<div
			className={
				"max-sm:w-full fixed " +
				(commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]") +
				" duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden"
			}
		>
			<div className="relative">
				<h1 className="font-medium text-md">Comments</h1>
				<p className="mt-2 w-[70%] line-clamp-1 text-dark-grey text-md">
					{title}
				</p>

				{/* Comment close button */}
				<button
					onClick={() => setCommentsWrapper((preVal) => !preVal)}
					className="absolute flex justify-center items-center w-8 h-8 right-0 top-0 bg-grey rounded-full "
				>
					<i className="fi fi-br-cross text-sm mt-1"></i>
				</button>
			</div>
			<hr className="mt-4 mb-10 -ml-10 w-[120%] border-grey " />
			<CommentField text="comment" action="comment" />
			
			{commentsArray && commentsArray.length ? (
				commentsArray.map((comment, i) => {
					return (
						<PageAnimation key={i}>
							<CommentCard
								index={i}
								leftVal={comment.childrenLevel * 4}
								commentData={comment}
							/>
						</PageAnimation>
					);
				})
			) : (
				<NoData message="No comments yet" />
			)}

			{total_parent_comments > totalParentComments ? (
				<button
					onClick={LoadMoreComments}
					className="flex items-center gap-2 text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md  "
				>
					Load more
				</button>
			) : (
				""
			)}
		</div>
	);
};
