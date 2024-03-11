import { useParams } from "react-router-dom";
import { InPageNavigation } from "../components/InPageNavigation";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
// import { PostCard } from "../components/PostCard";
import { NoData } from "../components/NoData";
import { filterPaginationData } from "../common/filterPaginationData";
import axios from "axios";
import { PageAnimation } from "../common/PageAnimation";
import { BlogPostCard } from "../components/BlogPostCard";
import { LoadMore } from "../components/LoadMore";
import { ProfileCard } from "../components/ProfileCard";

export const Search = () => {
	let { query } = useParams();
	let [blogs, setBlogs] = useState(null);
	let [users, setUsers] = useState(null);

	// SEARCH BLOGS
	const searchBlogs = ({ page = 1, createNewArray = false }) => {
		axios
			.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
				query,
				page,
			})
			.then(async ({ data }) => {
				let newData = await filterPaginationData({
					state: blogs,
					data: data.blogs,
					page,
					countRoute: "/total-search-blogs",
					dataToSend: { query },
					createNewArray,
				});
				setBlogs(newData);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// SEARCH PROFILE
	const searchProfiles = () => {
		axios
			.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-profile", { query })
			.then(({ data: { users } }) => {
				// console.log(users);
				setUsers(users);
			});
	};

	useEffect(() => {
		resetState();
		searchBlogs({ page: 1, createNewArray: true });
		searchProfiles();
	}, [query]);

	const resetState = () => {
		setBlogs(null);
		setUsers(null);
	};

	const SearchProfileCard = () => {
		return (
			<>
				{users == null ? (
					<Loader />
				) : users.length ? (
					users.map((user, i) => {
						return (
							<PageAnimation
								key={i}
								transition={{ duration: 1, delay: i * 0.08 }}
							>
								<ProfileCard user={user}></ProfileCard>
							</PageAnimation>
						);
					})
				) : (
					<NoData message="No related profile found" />
				)}
			</>
		);
	};
	return (
		<section className="h-cover flex justify-center gap-10 ">
			<div className="w-full ">
				<InPageNavigation
					routes={[`Search Reasults from "${query}"`, "Related Accounts"]}
					defaultHidden={["Related Accounts"]}
				>
					<>
						{blogs === null ? (
							<Loader />
						) : blogs.currentPageDocs.length ? (
							blogs.currentPageDocs.map((blog, i) => {
								return (
									<PageAnimation
										transition={{ duration: 1, delay: i * 0.1 }}
										key={i}
									>
										{/* <PostCard blog={blog} index={i} /> */}
										<BlogPostCard
											content={blog}
											author={blog.author.personal_info}
										/>
									</PageAnimation>
								);
							})
						) : (
							<NoData message={"No Related Blogs"} />
						)}
						<LoadMore state={blogs} fetchData={searchBlogs} />
					</>
					<SearchProfileCard />
				</InPageNavigation>
			</div>
			<div className=" hidden md:block lg:block min-w[40%] lg:min-w-[400px] md:min-w-[250px]  max-w-min border-l border-grey pl-8 pt-3 max-md-hidden ">
				<p className="font-medium text-xl mb-8 ">Profiles related to search</p>
				<SearchProfileCard />
			</div>
		</section>
	);
};
