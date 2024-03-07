import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getDate } from "../common/date";
import { UserContext } from "../App";
import axios from "axios";

const BlogStats = ({ stats }) => {
	return (
		<div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
			{Object.keys(stats).map((key, i) => {
				return !key.includes("parent") ? (
					<div
						key={i}
						className={
							"flex flex-col items-center w-full h-full justify-center p-4 px-6 " +
							(i != 0 ? "border-grey border-l " : "")
						}
					>
						<h1 className="text-xl lg:text-2xl mb-2">
							{stats[key].toLocaleString()}
						</h1>
						<p className="max-lg:text-dark-grey capitalize">
							{key.split("_")[1]}
						</p>
					</div>
				) : (
					""
				);
			})}
		</div>
	);
};

export const ManagePublishedBlogCard = ({ blog }) => {
	let { banner, blog_id, title, publishedAt, activity } = blog;
	let {
		userAuth: { token },
	} = useContext(UserContext);

	let [showStat, setShowStat] = useState(false);

	return (
		<div className="w-full">
			<div className="flex gap-10 mb-6 max-md:px-4 border-grey pb-6 items-center">
				<img
					src={banner}
					className="xl:block w-28 h-28 flex-none bg-grey object-cover"
				/>
				<div className="flex flex-col justify-between py-2 w-full ">
					<div>
						<Link
							to={`/blog/${blog_id}`}
							className="blog-title mb-4 hover:underline line-clamp-2"
						>
							{title}
						</Link>
						<p className="line-clamp-1">Published on {getDate(publishedAt)}</p>
					</div>
					<div className="flex gap-6 mt-3">
						<Link to={`/editor/${blog_id}`} className="pr-4 py-1 underline">
							Edit
						</Link>
						<button
							className="lg:hidden pr-4 py-1 underline"
							onClick={() => {
								setShowStat((preVal) => !preVal);
							}}
						>
							Stats
						</button>
						<button
							onClick={(e) => deleteBlog(blog, token, e.target)}
							className="pr-4 py-1 underline"
						>
							Delete
						</button>
					</div>
				</div>

				<div className="max-lg:hidden">
					<BlogStats stats={activity}></BlogStats>
				</div>
			</div>
			{showStat ? (
				<div className="lg:hidden">
					<BlogStats stats={activity}></BlogStats>
				</div>
			) : (
				""
			)}
		</div>
	);
};

export const ManageDraftBlogCard = ({ blog }) => {
	let { title, desc, blog_id, index } = blog;
	let {
		userAuth: { token },
	} = useContext(UserContext);
	index++;
	return (
		<div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
			<h1 className="blog-index text-center pl-4 md:pl-6 flex-none">
				{index < 10 ? "0" + index : index}
			</h1>
			<div>
				<h1 className="blog-title mb-3">{title}</h1>
				<p className="line-clamp-2 font-gelasio">
					{desc.length ? desc : "No Description"}
				</p>
				<div className="flex gap-6 mt-3">
					<Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">
						Edit
					</Link>
					<button
						onClick={(e) => deleteBlog(blog, token, e.target)}
						className="pr-4 py-2 underline"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};

const deleteBlog = (blog, token, target) => {
	let { index, blog_id, setState } = blog;
	target.setAttribute("disabled", true);
	axios
		.post(
			import.meta.env.VITE_SERVER_DOMAIN + "/delete-blog",
			{ blog_id },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		.then(({ data }) => {
			target.removeAttribute("disabled");
			setState((preVal) => {
				console.log(preVal);
				let { deletedDocCount, totalDocs, currentPageDocs } = preVal;
				currentPageDocs.splice(index, 1);

                if(!deletedDocCount){
                    deletedDocCount = 0
                }

                if(!currentPageDocs.length && totalDocs - 1 > 0 ){
                    return null
                }
                console.log({ ...preVal, totalDocs: totalDocs - 1, deletedDocCount: deletedDocCount + 1 })
                return { ...preVal, totalDocs: totalDocs - 1, deletedDocCount: deletedDocCount + 1 }

			});
		})
        .catch(err => {
            console.log(err)
        })
};
