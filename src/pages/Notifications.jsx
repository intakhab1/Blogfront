import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filterPaginationData";
import Loader from "../components/Loader";
import { PageAnimation } from "../common/PageAnimation";
import { NotificationCard } from "../components/NotificationCard";
import { NoData } from "../components/NoData";
import { LoadMore } from "../components/LoadMore";

export const Notifications = () => {
	let {
		userAuth,
		userAuth: { token, new_notification },
		setUserAuth,
	} = useContext(UserContext);

	const [filter, setFilter] = useState("all");
	const [notifications, setNotifications] = useState(null);

	let filters = ["all", "like", "comment", "reply"];

	const fetchNotifications = ({ page, deletedNotificationCount = 0 }) => {
		axios
			.post(
				import.meta.env.VITE_SERVER_DOMAIN + "/notifications",
				{
					page,
					filter,
					deletedNotificationCount,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			.then(async ({ data: { notifications: data } }) => {
				// console.log(data)
				if (new_notification) {
					setUserAuth({ ...userAuth, new_notification: false });
				}
				let formatedData = await filterPaginationData({
					state: notifications,
					data,
					page,
					countRoute: "/total-notifications-count",
					data_to_send: { filter },
					user: token,
				});
				setNotifications(formatedData);
				// console.log(formatedData);
			})
			.catch((err) => {
				console.log(err.message);
			});
	};
	useEffect(() => {
		if (token) {
			fetchNotifications({ page: 1 });
		}
	}, [token, filter ]);

	const handleFilter = (e) => {
		let btn = e.target;
		setFilter(btn.innerHTML);
		setNotifications(null);
	};

	return (
		<div>
			<h1 className="max-md:hidden">Recent Notifications</h1>
			<div className="flex my-8 gap-6">
				{filters.map((filterName, i) => {
					return (
						<button
							key={i}
							className={
								"py-2 " + (filter == filterName ? "btn-dark" : "btn-light")
							}
							onClick={handleFilter}
						>
							{filterName}
						</button>
					);
				})}
			</div>
			{notifications == null ? (
				<Loader />
			) : (
				<>
					{notifications.currentPageDocs.length ? (
						notifications.currentPageDocs.map((notification, i) => {
							return (
								<PageAnimation key={i} transition={{ dalay: i * 0.08 }}>
									<NotificationCard
										data={notification}
										index={i}
										notificationState={{ notifications, setNotifications }}
									/>
								</PageAnimation>
							);
						})
					) : (
						<NoData message="No Notification Availabe" />
					)}
					<LoadMore
						state={notifications}
						fetchData={fetchNotifications}
						additionalParam={{
							deletedNotificationCount: notifications.deletedNotificationCount,
						}}
					/>
				</>
			)}
		</div>
	);
};
