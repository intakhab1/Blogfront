import { useContext } from "react"
import { PageAnimation  } from "../common/PageAnimation"
import { Link } from "react-router-dom"
import { UserContext } from "../App"
import { removeFromSession } from "../common/session"

export const UserNavigationPanel = () => {
    const {userAuth: {username}, setUserAuth} = useContext(UserContext);
    
    const logOutUser= () => {
        removeFromSession("user");
        setUserAuth({token : null})
        
    }

  return (
    <PageAnimation 
    transition={{duration: 0.2}}
    className="absolute right-0 z-50"
    >
    <div className="bg-white absolute right-0 border border-grey w-60 duration-200">
        <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
            <i className="fi fi-rr-file-edit"></i>
            <p>Write blog</p>
        </Link>
        <Link to={`/user/${username}`} className="flex gap-2 link pl-8 py-4">
        <i className="fi fi-rr-user"></i>
            View Profile
        </Link>
        <Link to="/dashboard/blogs" className="flex gap-2 link pl-8 py-4">
        <i className="fi fi-rs-chart-pie-alt"></i>
            Go To Dashboard
        </Link>
        <Link to="/settings/edit-profile" className="flex gap-2 link pl-8 py-4">
        <i className="fi fi-rr-settings"></i>
            Change Settings
        </Link>
        <span className="absolute border-t border-grey w-[100%]"></span>
        <button className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
                onClick={logOutUser}
        >
            <h1 className="font-bold text-md mg-1">Log out</h1>
            <p className="text-dark-grey">@{username}</p>
        </button>

    </div>
    </PageAnimation>
  )
}
