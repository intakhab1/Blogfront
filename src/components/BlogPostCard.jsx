import { getDate, getFullDay } from "../common/date";
import { Link } from "react-router-dom";

export const BlogPostCard = ({ content, author }) => {
	let {
		publishedAt,
		tags,
		title,
		desc,
		banner,
		activity: { total_likes, total_comments, total_reads },
		blog_id: id,
	} = content;
	let { fullname, profile_img, username } = author;

	return (
		<Link
			to={`/blog/${id}`}
			className="flex gap-8 items-center border-b border-grey pb-5 mb-8"
		>
			<div className="w-full overflow-auto no-scrollbar ">
				<div className="flex gap-2 items-center mb-7 ">
					<img src={profile_img} className=" flex-none w-8 h-8 rounded-full" />
					<p className="line-clamp-1">{fullname} </p>
					<p className="line-clamp-1 opacity-50 text-sm ">@{username}</p>
					<p className="min-w-fit opacity-50 text-sm">{getFullDay(publishedAt)}</p>
				</div>

				<h1 className="blog-title -mt-4">{title}</h1>
				<p className="my-3 text-xl font-gelasio leading-7 md:max-[1100px]:hidden line-clamp-2  max-sm:hidden  ">
					{desc}
				</p>

				<div className="flex gap-2 mt-7 mb-7 ">
					<span className="btn-light py-1 px-3 text-sm ">{tags[0]}</span>
					<span className="ml-3 text-sm  flex items-center gap-2 text-dark-grey">
						<i className="fi fi-rr-heart text-md"></i>
						{total_likes}
					</span>
					<span className="ml-3 text-sm flex items-center gap-2 text-dark-grey">
						<i className="fi fi-rr-comment-dots text-md"></i>
						{total_comments}
					</span>
					<span className="ml-3 text-sm  flex items-center gap-2 text-dark-grey">
						<i className="fi fi-rr-eye text-md"></i>
						{total_reads}
					</span>

				</div>
			</div>

			<div className="h-40 aspect-square bg-grey ">
				<img
					src={banner}
					className="w-full h-full aspect-square object-cover"
				/>
			</div>
		</Link>
	);
};
