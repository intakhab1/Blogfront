import { Link } from "react-router-dom"
import { getDate } from "../common/date";

export const TrendingBlogCard = ({blog, index}) => {

  let { title, blog_id: id, author:{ personal_info: {fullname, username, profile_img}}, publishedAt } = blog

  return (
    <Link to={`/blog/${id}`} className="w-full flex gap-8 mb-8 items-center border-b border-grey pb-5 " > 
      
      <div>
        <div className="flex gap-2 items-center mb-7">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">{fullname} </p>
          <p className="line-clamp-1 opacity-50 text-sm ">@{username}</p>
          <p className="min-w-fit opacity-50  text-sm">{getDate(publishedAt)}</p>
        </div>

        <h1 className="blog-title -mt-4">{title}</h1>
      </div>
    </Link>
  )
}
