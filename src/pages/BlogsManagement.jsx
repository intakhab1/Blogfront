import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filterPaginationData";
import { Toaster } from "react-hot-toast";
import { InPageNavigation } from "../components/InpageNavigation";
import Loader from "../components/Loader";
import { NoData } from "../components/NoData";
import { PageAnimation } from "../common/PageAnimation";
import {
	ManageDraftBlogCard,
	ManagePublishedBlogCard,
} from "../components/ManagePublishedBlogCard";
import { LoadMore } from "../components/LoadMore";
import { useSearchParams } from "react-router-dom";

export const BlogsManagement = () => {
	let {
		userAuth: { token },
	} = useContext(UserContext);

	const [blogs, setBlogs] = useState(null);
	const [drafts, setDrafts] = useState(null);
	const [query, setQuery] = useState("");

	let activeTab = useSearchParams()[0].get("tab");

	const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {
		axios
			.post(
				import.meta.env.VITE_SERVER_DOMAIN + "/user-written-blogs",
				{
					page,
					draft,
					query,
					deletedDocCount,
				},
				{
					headers: {
						Authorization: `Bearer: ${token}`,
					},
				}
			)
			.then(async ({ data }) => {
				let formatedData = await filterPaginationData({
					state: draft ? drafts : blogs,
					data: data.blogs,
					page,
					user: token,
					countRoute: "/user-written-blogs-count",
					data_to_send: { draft, query },
				});
				// console.log(formatedData);
				if (draft) {
					setDrafts(formatedData);
				} else {
					setBlogs(formatedData);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};
	const handleSearch = (e) => {
		let searchQuery = e.target.value;
		setQuery(searchQuery);
		if (e.keyCode == 13 && searchQuery.length) {
			setBlogs(null);
			setDrafts(null);
		}
	};
	const handleChange = (e) => {
		if (!e.target.value.length) {
			setQuery("");
			setBlogs(null);
			setDrafts(null);
		}
	};

	useEffect(() => {
		if (token) {
			if (blogs == null) {
				getBlogs({ page: 1, draft: false });
			}
			if (drafts == null) {
				getBlogs({ page: 1, draft: true });
			}
		}
	}, [token, blogs, drafts, query]);

	return (
		<div className="w-full">
			<h1 className="max-md:hidden">Manage Your Blogs</h1>
			<Toaster />
			<div className="relative max-md:mt-5 md:mt-8 mb-10 ">
				<input
					type="search"
					onChange={handleChange}
					onKeyDown={handleSearch}
					className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
					placeholder="Search Blogs"
				/>
				<i className="absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 fi fi-rr-search"></i>
			</div>
			<InPageNavigation
				routes={["Published Blogs", "Drafts"]}
				defaultTab={activeTab != "draft" ? 0 : 1}
			>
				{
					// published blogs
					blogs == null ? (
						<Loader />
					) : blogs.currentPageDocs.length ? (
						<>
							{blogs.currentPageDocs.map((blog, i) => {
								return (
									<PageAnimation key={i} transition={{ delay: i * 0.04 }}>
										<ManagePublishedBlogCard
											blog={{ ...blog, index: i, setState: setBlogs }}
										/>
									</PageAnimation>
								);
							})}
							<LoadMore
								state={blogs}
								fetchData={getBlogs}
								additionalParam={{
									draft: false,
									deletedDocCount: blogs.deletedDocCount,
								}}
							/>
						</>
					) : (
						<NoData message="No published blogs" />
					)
				}
				{
					// draft blogs
					drafts == null ? (
						<Loader />
					) : drafts.currentPageDocs.length ? (
						<>
							{drafts.currentPageDocs.map((blog, i) => {
								return (
									<PageAnimation key={i} transition={{ delay: i * 0.04 }}>
										<ManageDraftBlogCard
											blog={{ ...blog, index: i, setState: setDrafts }}
										/>
									</PageAnimation>
								);
							})}

							<LoadMore
								state={drafts}
								fetchData={getBlogs}
								additionalParam={{
									draft: true,
									deletedDocCount: drafts.deletedDocCount,
								}}
							/>
						</>
					) : (
						<NoData message="No draft blogs" />
					)
				}
			</InPageNavigation>
		</div>
	);
};
