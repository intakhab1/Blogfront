import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/BlogPage";

export const CommentField = ({
	text,
	action,
	index = undefined,
	replyingTo = undefined,
	setIsReplying,
}) => {
	let {
		blog,
		blog: {
			_id,
			comments,
			comments: { results: comment_array },
			author: { _id: blog_author },
			activity,
			activity: { total_comments, total_parent_comments },
		},
		setBlog,
		setTotalParentComments,
	} = useContext(BlogContext);
	let {
		userAuth: { token, username, fullname, profile_img },
	} = useContext(UserContext);

	const [comment, setComment] = useState("");

	const handleComment = () => {
		if (!token) {
			return toast.error("Login to add a comment");
		}
		if (!comment.length) {
			return toast.error("Please write something to add a comment");
		}
		// add a comment
		axios
			.post(
				import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
				{
					_id,
					blog_author,
					comment,
					replying_to: replyingTo,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			.then(({ data }) => {
				// console.log(data);
				setComment("");
				data.commented_by = {
					personal_info: {
						username,
						profile_img,
						fullname,
					},
				};

				// Nested Reply
				let newCommentArray;

				if (replyingTo) {
					comment_array[index].children.push(data._id);
					data.childrenLevel = comment_array[index].childrenLevel + 1;
					data.parentIndex = index;

					comment_array[index].isReplyLoaded = true;
					comment_array.splice(index + 1, 0, data);
					// [1, 2, 3] => [replying 4 to 2 i.e 2 => 4] => [1, 2, (data=4) , 3]
					newCommentArray = comment_array;

					// Hide reply field after replying
                    setIsReplying(false)
				} else {
					data.childrenLevel = 0; // 0 = parent comment, 1 = 1st reply to parent comment
					newCommentArray = [data, ...comment_array];
				}

				let parentCommentIncrementVal = replyingTo ? 0 : 1;
				setBlog({
					...blog,
					comments: { ...comments, results: newCommentArray },
					activity: {
						...activity,
						total_comments: total_comments + 1,
						total_parent_comments:
							total_parent_comments + parentCommentIncrementVal,
					},
				});
				setTotalParentComments((preVal) => preVal + parentCommentIncrementVal);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<>
			<Toaster />
			<div className="flex gap-2 -mt-6 relative">
				<input
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					placeholder={`Add a ${text}...`}
					className="input-box h-10 pl-5 placeholder:text-dark-grey placeholder:opacity-50 resize-none overflow-auto no-scrollbar"
				></input>
				<button onClick={handleComment} className="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none">
				<i className="fi fi-rs-paper-plane text-sm"></i>

					{/* {action} */}
				</button>
			</div>

		</>
	);
};
