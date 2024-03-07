import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getDate, getFullDay } from "../common/date";
import { NotificationCommentField } from "./NotificationCommentField";
import { UserContext } from "../App";
import axios from "axios";

export const NotificationCard = ({ data, index, notificationState }) => {
	let {
		seen,
		reply,
		_id: notification_id,
		comment,
		createdAt,
		blog: { _id, blog_id, title },
		replied_on_comment,
		type,
		user,
		user: {
			personal_info: { profile_img, fullname, username },
		},
	} = data;

	let {
		notifications,
		notifications: { currentPageDocs, totalDocs },
		setNotifications,
	} = notificationState;

	let {
		userAuth: {
			username: author_username,
			profile_img: author_profile_img,
			token,
		},
	} = useContext(UserContext);

	let [isReplying, setIsReplying] = useState(false);

	const handleReply = () => {
		setIsReplying((preVal) => !preVal);
	};
	const handleDelete = (comment_id, type, target) => {
		target.setAttribute("disabled", true);
		axios
			.post(
				import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
				{ _id: comment_id },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			.then(() => {
				if (type == "comment") {
					currentPageDocs.splice(index, 1);
				} else {
					delete currentPageDocs[index].reply;
				}
				target.removeAttribute("disabled");
				setNotifications({
					...notifications,
					currentPageDocs,
					totalDocs: totalDocs - 1,
					deletedNotificationCount: notifications.deletedNotificationCount + 1,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<div
			className={
				"p-6 border-b border-grey border-l-black " + (!seen ? "border-l-2" : "")
			}
		>
			<div className="flex gap-5 mb-3">
				<img src={profile_img} className="flex-none w-14 h-14 rounded-full" />
				<div className="w-full">
					<h1 className="text-xl font-medium text-dark-grey">
						<span className="lg:inline-block hidden capitalize">
							{fullname}
						</span>
						<Link
							to={`/user/${username}`}
							className="mx-1 text-black underline"
						>
							@{username}
						</Link>
						<span className="font-normal">
							{type == "like"
								? "liked your post"
								: type == "comment"
								? "commented on "
								: "replied on "}
						</span>
					</h1>
					{type == "reply" ? (
						<div className="p-4 mt-4 rounded-md bg-grey">
							<p>{replied_on_comment.comment}</p>
						</div>
					) : (
						<Link
							to={`/blog/${blog_id}`}
							className="font-medium text-dark-grey hover:underline line-clamp-1"
						>{`"${title}"`}</Link>
					)}
				</div>
			</div>
			{type != "like" ? (
				<p className="ml-14 pl-5 font-gelasio text-xl my-5">
					{comment.comment}
				</p>
			) : (
				""
			)}
			<div className="flex gap-8 ml-14 pl-5 mt-3 text-dark-grey">
				<p>{getFullDay(createdAt)}</p>
				{type != "like" ? (
					<>
						{!reply ? (
							<button
								onClick={handleReply}
								className="underline hover:text-black"
							>
								Reply
							</button>
						) : (
							""
						)}
						<button
							onClick={(e) => handleDelete(reply._id, "reply", e.target)}
							className="underline hover:text-black"
						>
							Delete
						</button>
					</>
				) : (
					""
				)}
			</div>
			{isReplying ? (
				<div className="mt-8">
					<NotificationCommentField
						_id={_id}
						blog_author={user}
						index={index}
						replyingTo={comment._id}
						setIsReplying={setIsReplying}
						notification_id={notification_id}
						notificationData={notificationState}
					/>
				</div>
			) : (
				""
			)}
			{reply ? (
				<div className="ml-20 p-5 bg-grey mt-5 rounded-md">
					<div className="flex gap-3 mb-3">
						<img src={author_profile_img} className="w-8 h-8 rounded-full " />
						<div>
							<h1 className="font-medium text-xl text-dark-grey">
								<Link
									to={`/user/${author_username}`}
									className="mx-1 text-black underline "
								>
									@{author_username}
								</Link>
								<span className="font-normal">replied to</span>
								<Link
									to={`/user/${username}`}
									className="mx-1 text-black underline "
								>
									@{username}
								</Link>
							</h1>
						</div>
					</div>
					<p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>

					<button
						onClick={(e) => handleDelete(comment._id, "reply", e.target)}
						className="underline ml-14 mt-2 hover:text-black"
					>
						Delete
					</button>
				</div>
			) : (
				""
			)}
		</div>
	);
};
