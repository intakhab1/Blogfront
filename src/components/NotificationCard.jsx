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
			<div className="flex gap-2 mb-2">
				<Link
					to={`/user/${username}`}
					className="flex-none w-12 h-12 rounded-full"
				>
					<img src={profile_img} className="flex-none w-12 h-12 rounded-full" />
				</Link>

				<div className="w-full ">
					<h1 className="flex mt-3 gap-2 text-xl font-medium text-dark-grey">
						<span className="lg:inline-block hidden capitalize">
							{fullname}
						</span>
						<Link
							to={`/user/${username}`}
							className="mx-1 text-black underline"
						>
							@{username}
						</Link>
						<p className="min-w-fit opacity-50 text-sm mt-0.5 ">{getFullDay(createdAt)}</p>
						<span className="min-w-fit opacity-50 text-sm mt-0.5">
							{type == "like"
								? "liked your post"
								: type == "comment"
								? "commented on "
								: "replied on "}
						</span>
					</h1>

					{type == "reply" ? (

					<div className="flex flex-col justify-between p-2 bg-grey rounded-md mt-2">
						<div className="flex justify-between">
							<div className="flex gap-2 mb-1">
								<Link
									to={`/user/${author_username}`}
								>
								<img src={author_profile_img} className="flex-none w-8 h-8 rounded-full" />
								</Link>

								<h1 className="font-medium text-md text-dark-grey ">
									<Link
										to={`/user/${author_username}`}
										className="mx-1 text-black underline "
									>
										@{author_username}
									</Link>
								</h1>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 ">
							<p className="ml-11 text-md -mt-2">{replied_on_comment.comment}</p>
						</div> 
					</div>

					) : (
						<Link
							to={`/blog/${blog_id}`}
							className="mt-2 font-medium text-dark-grey hover:underline line-clamp-1"
						>{`"${title}"`}</Link>
					)}
				</div>
			</div>
			{type != "like" ? (
				<div className="flex flex-col justify-between ml-20 p-2 bg-grey rounded-md">
					<div className="flex justify-between">
						<div className="flex gap-2 mb-1">
							<Link
								to={`/user/${username}`}
							>
								<img src={profile_img} className="flex-none w-8 h-8 rounded-full" />
							</Link>

								<h1 className="font-medium text-md text-dark-grey ">
									<Link
										to={`/user/${username}`}
										className="mx-1 text-black underline "
									>
										@{username}
									</Link>
								</h1>
						</div>
							
						<button
							onClick={(e) => handleDelete(comment._id, "comment", e.target)}
							className=" hover:text-black -mt-4 "
							>
							<i className="fi fi-rr-trash hover:text-red min-w-fit opacity-50 text-sm"></i>
						</button> 
					</div>
					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 ">
						<p className="ml-11 text-md -mt-2">{comment.comment}</p>
					</div> 
				</div>

			) : (
				""
			)}
			<div className="flex gap-8 ml-14 pl-5 mt-2 text-dark-grey">
				{type != "like" ? (
					<>
						{!reply ? (
							<button
								onClick={handleReply}
								className="ml-5 hover:text-black min-w-fit opacity-50 text-sm"
							>
								... Add a reply
							</button>
						) : (
							""
						)}
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
				<div className="flex flex-col justify-between ml-24 p-2 bg-grey rounded-md">
					<div className="flex justify-between">
						<div className="flex gap-2 mb-1">
							<Link
								to={`/user/${author_username}`}
							>
								<img src={author_profile_img} className="flex-none w-8 h-8 rounded-full" />
							</Link>

								<h1 className="font-medium text-md text-dark-grey ">
									<Link
										to={`/user/${author_username}`}
										className="mx-1 text-black underline "
									>
										@{author_username}
									</Link>
								</h1>
						</div>
							
						<button
							onClick={(e) => handleDelete(reply._id, "reply", e.target)}
							className=" hover:text-black -mt-4 "
							>
							<i className="fi fi-rr-trash hover:text-red min-w-fit opacity-50 text-sm"></i>
						</button> 
					</div>
					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 ">
						<p className="ml-11 text-md -mt-2">{reply.comment}</p>
					</div> 
				</div>

			) : (
				""
			)}
		</div>
	);
};

				{/* <p className="flex justify-between my-5 ml-24 pl-5 p-2 rounded-md bg-grey font-gelasio text-xl">

					<Link to={`/user/${username}`}
						className="flex-none w-8 h-8 rounded-full"
					><img src={profile_img} className="flex-none w-8 h-8 rounded-full "/>
					</Link>

						{comment.comment}
					<button
						onClick={(e) => handleDelete(comment._id, "comment", e.target)}
						className="hover:text-black"
					>
					<i className="fi fi-rr-trash mr-2 "></i>
					</button>
				</p> */}