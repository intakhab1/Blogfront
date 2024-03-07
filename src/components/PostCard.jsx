import { Link } from "react-router-dom";
import { getDate, getFullDay } from "../common/date";

export const PostCard = ({ blog, index }) => {
	let {
		title,
		blog_id: id,
		author: {
			personal_info: { fullname, username, profile_img },
		},
		publishedAt,
		banner,
		desc,
		activity: { total_likes },
	} = blog;

	return (
		<Link
			to={`/blog/${id}`}
			className="w-full flex gap-8 mb-8 items-center border-b border-grey pb-5 "
		>
			{/* <h1 className="blog-index hidden sm:hidden md:block lg:block" >{index < 10 ? "0" + (index + 1) : index}</h1> */}

			<div className="w-full">
				<div className="flex gap-2 items-center mb-7">
					<img src={profile_img} className="w-6 h-6 rounded-full" />
					<p className="line-clamp-1">{fullname} </p>
					<p className="line-clamp-1 opacity-50 text-sm ">@{username}</p>
					<p className="min-w-fit opacity-50 text-sm">
						{getFullDay(publishedAt)}
					</p>
				</div>

				<h1 className="blog-title -mt-4">{title}</h1>
				<p className="my-3 text-xl font-gelasio leading-7 md:max-[1100px]:hidden line-clamp-2  max-sm:hidden  ">
					{desc}
				</p>

				<div className="w-full h-64 bg-grey aspect-square ">
					<img
						src={banner}
						className="mt-3 w-full h-full a object-cover aspect-square"
					/>
				</div>

				<div className="flex gap-4 mt-7 mb-7">
					<span className="ml-3 flex items-center gap-2 text-dark-grey">
						<i className="fi fi-rr-heart text-xl"></i>
						{total_likes}
					</span>
				</div>
			</div>
		</Link>
	);
};
