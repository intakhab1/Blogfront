import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import darkLogo from "../imgs/full-logo-dark.png";
import lightLogo from "../imgs/full-logo-light.png";
import { useContext, useEffect, useState } from "react";
import { ThemeContext, UserContext } from "../App";
import { UserNavigationPanel } from "./UserNavigationPanel";
import axios from "axios";
import { storeInSession } from "../common/session";

export const Navbar = () => {
	let { theme, setTheme } = useContext(ThemeContext);
	const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
	const [navPanelVisibility, setNavPanelVisibility] = useState(false);
	const {
		userAuth,
		userAuth: { token, profile_img, new_notification },
		setUserAuth,
	} = useContext(UserContext);

	let navigate = useNavigate();

	const handleSearch = (e) => {
		let searchQuery = e.target.value;

		if (e.keyCode === 13 && searchQuery.length) {
			navigate(`/search/${searchQuery}`);
		}
	};

	useEffect(() => {
		if (token) {
			axios
				.get(import.meta.env.VITE_SERVER_DOMAIN + "/new-notification", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then(({ data }) => {
					setUserAuth({ ...userAuth, ...data });
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, [token,]);

	const handleNavPanelVisibility = () => {
		setNavPanelVisibility((currentVal) => !currentVal);
	};
	const handleBlur = () => {
		setTimeout(() => {
			setNavPanelVisibility(false);
		}, 150);
	};

	// change theme
	const changeTheme = () => {
		let newTheme = theme == "light" ? "dark" : "light";
		setTheme(newTheme);
		document.body.setAttribute("data-theme", newTheme);
		storeInSession("theme", newTheme);
	};

	return (
		<>
			<nav className="navbar z-50">
				<Link to="/" className="flex-none w-36">
					<img
						src={theme == "light" ? darkLogo : lightLogo}
						className="w-full"
					></img>
				</Link>
				<div
					className={
						"absolute bg-white w-1/2 left-0  mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " +
						(searchBoxVisibility ? "show" : "hide")
					}
				>
					{/* SEARCH BOX */}
					<input
						input="text"
						onKeyDown={handleSearch}
						placeholder="Search"
						className="w-full md:w-auto bg-grey p-4 pl-6 pr-[18%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12 "
					></input>
					<i className=" fi fi-rr-search absolute hidden md:block lg:block right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey "></i>
				</div>
				
				<div className="flex items-center gap-1 md:gap-6 ml-auto">
					<button
						className="md:hidden w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/10"
						onClick={() => {
							setSearchBoxVisibility((currentVal) => !currentVal);
						}}
					>
						<i className="fi fi-rr-search text-xl absolute"></i>
					</button>
					<Link to="/editor" className=" md:flex gap-2 rounded-full link ">
						<i className="fi fi-rr-file-edit"></i>
						<p className="hidden md:block lg:block xl:block">Write</p>
					</Link>
					<button
						className="w-11 h-11 rounded-full relative hover:bg-black/10"
						onClick={changeTheme}
					>
						<i
							className={
								"text-xl block mt-1 fi fi-rr-" +
								(theme == "light" ? "moon" : "brightness")
							}
						></i>
					</button>
					{token ? (
						<>
							<NavLink to="/dashboard/notifications">
								<button className="w-11 h-11 rounded-full relative hover:bg-black/10">
									<i className="fi fi-rr-bell text-xl block mt-1"></i>
									{new_notification ? (
										<span className="absolute w-2 h-2 bg-red rounded-full z-10 top-3 right-3 "></span>
									) : (
										""
									)}
								</button>
							</NavLink>
							<div
								className="relative"
								onClick={handleNavPanelVisibility}
								onBlur={handleBlur}
							>
								<button className="w-11 h-11 mt-1">
									<img
										src={profile_img}
										className="w-full h-full object-cver rounded-full "
									/>
								</button>
								{navPanelVisibility ? <UserNavigationPanel /> : ""}
							</div>
						</>
					) : (
						<>
							<Link to="/login" className="btn-dark py-2">
								Log in
							</Link>
							<Link to="/signup" className="btn-light py-2 hidden md:block">
								Sign up
							</Link>
						</>
					)}
				</div>
			</nav>
			<Outlet />
		</>
	);
};
