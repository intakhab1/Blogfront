import React, { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

export const NotificationCommentField = ({
	_id,
	blog_author,
	index = undefined,
	replyingTo = undefined,
	setIsReplying,
	notification_id,
	notificationData,
}) => {
	let [comment, setComment] = useState("");
	let { _id: user_id } = blog_author;
	let {
		userAuth: { token },
	} = useContext(UserContext);
	let {
		notifications,
		notifications: { currentPageDocs },
		setNotifications,
	} = notificationData;

	const handleComment = () => {
		if (!comment.length) {
			return toast.error("Please write something to add a comment");
		}
		// add a comment
		axios
			.post(
				import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
				{
					_id,
					blog_author: user_id,
					comment,
					replying_to: replyingTo,
                    notification_id
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			.then(({ data }) => {
                // console.log(data)
                // console.log(currentPageDocs)
                setIsReplying(false) 
                currentPageDocs[index].reply = { comment, _id: data._id }
                setNotifications({ ...notifications, currentPageDocs })
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
					placeholder="Add a reply..."
					className="input-box h-10 pl-5 placeholder:text-dark-grey placeholder:opacity-50 resize-none no-scrollbar  ml-24"
				></input>
				<button
					onClick={handleComment}
					className="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none "
				>
				<i className="fi fi-rs-paper-plane text-sm"></i>
				</button>
			</div>

		</>
	);
};
