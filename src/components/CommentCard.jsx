import React, { useContext, useState } from "react";
import { getDate, getFullDay } from "../common/date";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import { CommentField } from "./CommentField";
import { BlogContext } from "../pages/BlogPage";
import axios from "axios";
import { Link } from "react-router-dom";

export const CommentCard = ({ index, leftVal, commentData }) => {
	let {
		_id,
		comment,
		commentedAt,
		commented_by: {
			personal_info: { profile_img, fullname, username: commented_by_username },
		},
		children,
	} = commentData;

	let {
		userAuth: { token, username },
	} = useContext(UserContext);

	let {
		blog,
		blog: {
			comments,
			comments: { results: commentsArray },
			activity,
			activity: { total_parent_comments },
			author: {
				personal_info: { username: blog_author },
			},
		},
		setBlog,
		setTotalParentComments,
	} = useContext(BlogContext);

	const [isReplying, setIsReplying] = useState(false);

	// handle reply
	const handleReply = () => {
		if (!token) {
			return toast.error("Please login to give a reply");
		}
		setIsReplying((preVal) => !preVal);
	};

	// delete comment
	const getParentIndex = () => {
		let startingPoint = index - 1;
		try {
			while (
				commentsArray[startingPoint].childrenLevel >= commentData.childrenLevel
			) {
				startingPoint--;
			}
		} catch {
			startingPoint = undefined;
		}
		return startingPoint;
	};

	const removeCommentsCards = (startingPoint, isDelete = false) => {
		if (commentsArray[startingPoint]) {
			while (
				commentsArray[startingPoint].childrenLevel > commentData.childrenLevel
			) {
				commentsArray.splice(startingPoint, 1);

				if (!commentsArray[startingPoint]) {
					break;
				}
			}
		}
		// delete comment
		if (isDelete) {
			let parentIndex = getParentIndex();

			if (parentIndex != undefined) {
				commentsArray[parentIndex].children = commentsArray[
					parentIndex
				].children.filter((child) => child != _id);

				if (commentsArray[parentIndex].children.length) {
					commentsArray[parentIndex].isReplyLoaded = false;
				}
			}
			commentsArray.splice(index, 1);
		}
		if (commentData.childrenLevel == 0 && isDelete) {
			setTotalParentComments((preVal) => preVal - 1);
		}
		setBlog({
			...blog,
			comments: { results: commentsArray },
			activity: {
				...activity,
				total_parent_comments:
					total_parent_comments - commentData.childrenLevel == 0 && isDelete
						? 1
						: 0,
			},
		});
	};

	// Delete comment
	const deleteComment = (e) => {
		e.target.setAttribute("disabled", true);
		axios
			.post(
				import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
				{
					_id,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			.then(() => {
				e.target.removeAttribute("disabled");
				removeCommentsCards(index + 1, true);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// Hide replies
	const hideReply = () => {
		commentData.isReplyLoaded = false;
		removeCommentsCards(index + 1);
	};
	// Show replies
	const ViewReplies = ({ skip = 0, currentIndex = index }) => {
		if (commentsArray[currentIndex].children.length) {
			hideReply();
			axios
				.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", {
					_id: commentsArray[currentIndex]._id ,
					skip,
				})
				.then(({ data: { replies } }) => {
					commentsArray[currentIndex].isReplyLoaded = true;
					for (let i = 0; i < replies.length; i++) {
						replies[i].childrenLevel = commentsArray[currentIndex].childrenLevel + 1;

						commentsArray.splice(currentIndex + 1 + i + skip, 0, replies[i]);
					}
					setBlog({
						...blog,
						comments: { ...comments, results: commentsArray },
					});
				})
				.catch((err) => {
					console.log(err);
				});
		}
	};

    // Load more replies
    const LoadMoreReplies = () =>{

        let parentIndex = getParentIndex()
        // View more button
        let button = <button onClick={() => ViewReplies({ skip: index - parentIndex, currentIndex: parentIndex })} className="flex items-center gap-2 text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md ">View more replies</button>
        
        if(commentsArray[index + 1]){
            if(commentsArray[index + 1].childrenLevel < commentsArray[index].childrenLevel){
                if((index - parentIndex) < commentsArray[parentIndex].children.length ){
                    
                    return button
                }
            }
        }else{
            if(parentIndex){
                if((index - parentIndex) < commentsArray[parentIndex].children.length ){
                    
                    return button
                }
            }
        }
    }

	return (
		<div className="w-full" >
			<Toaster />
			<div className="w-full my-2 p-2 rounded-md  border-grey">
				<div className="flex gap-3 items-center mb-1 ">

					<Link
						to={`/user/${commented_by_username}`}
					>
						<img src={profile_img} className="flex-none w-6 h-6 rounded-full " />
					</Link>

						<p className="line-clamp-1 ">
						<Link
						to={`/user/${commented_by_username}`}
					>
							{fullname} @{commented_by_username}
					</Link>

						</p>

					<p className="min-w-fit opacity-50 text-sm">{getFullDay(commentedAt)}</p>
				</div>

				<p className=" text-md ml-9">{comment}</p>

				<div className="flex gap-5 items-center ml-4">
					{commentData.isReplyLoaded ? (
						<button
							onClick={hideReply}
							className="ml-2 flex items-center gap-2 text-dark-grey p-2 px-3 rounded-md min-w-fit opacity-50 text-sm "
						>
						... Hide replies
						</button>
					) : (
						<button
							onClick={ViewReplies}
							className="ml-2 flex items-center gap-2 text-dark-grey p-2 px-3 rounded-md min-w-fit opacity-50 text-sm"
						>	... View {children.length} replies
						</button>
					)}
					<button onClick={handleReply} className="underline min-w-fit opacity-50 text-sm">
						Reply
					</button>
					{username == commented_by_username || username == blog_author ? (
						<button
							onClick={deleteComment}
							className="flex items-center p-2 px-3 rounded-md ml-auto hover:text-red opacity-50 text-sm"
						>
							<i className="fi fi-rr-trash pointer-events-none"></i>
						</button>
					) : (
						""
					)}
				</div>

				{isReplying ? (
					<div className="mt-7 ml-9 mb-6">
						<CommentField
							text="reply"
							action="reply"
							index={index}
							replyingTo={_id}
							setIsReplying={setIsReplying}
						/>
					</div>
				) : (
					""
				)}
			</div>
            <LoadMoreReplies/>
		</div>
	);
};
