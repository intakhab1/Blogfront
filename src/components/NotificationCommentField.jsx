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
			<textarea
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				placeholder="Add a reply..."
				className="input-box pl-5 placeholder:text-dark-grey resize-none h-[100px] overflow-auto"
			></textarea>
			<button onClick={handleComment} className="btn-dark mt-5 px-10">
				Reply
			</button>
		</>
	);
};
