import { Link } from "react-router-dom";


export const ProfileCard = ({user}) => {
    let { personal_info: {fullname, username, profile_img} } = user;
    console.log(fullname)
  return (
    <Link to={`/user/${username}`} className="flex gap-5 items-center mb-5">
        <img src={profile_img} className="w-14 rounded-full h-14"/>
        <div>
            <h1 className="font-medium text-xl line-clamp-2">{fullname} </h1>
            <p className="text-dark-grey">@{username} </p>
        </div>
    </Link>
  )
}
