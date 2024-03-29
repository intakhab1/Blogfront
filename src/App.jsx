import { Navbar } from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import { UserAuthForm } from "./pages/UserAuthForm";
import { createContext, useContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import { Editor } from "./pages/Editor";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { PageNotFound } from "./pages/PageNotFound";
import { Profile } from "./pages/Profile";
import { BlogPage } from "./pages/BlogPage";
import { SideNavbar } from "./components/SideNavbar";
import { ChangePassword } from "./pages/ChangePassword";
import { EditProfile } from "./pages/EditProfile";
import { Notifications } from "./pages/Notifications";
import { BlogsManagement } from "./pages/BlogsManagement";

export const UserContext = createContext({});
export const ThemeContext = createContext({});

const defaultThemePreference = () => {
	window.matchMedia("(prefers-color-scheme: dark)").matches
}

const App = () => {
	const [userAuth, setUserAuth] = useState({});
	const [theme, setTheme] = useState(() => defaultThemePreference() ? "light" : "dark" );

	useEffect(() => {
		let userInSession = lookInSession("user");
		userInSession
			? setUserAuth(JSON.parse(userInSession))
			: setUserAuth({ token: null });
		
		// dark and light theme
		let themeInSession = lookInSession("theme");
		if (themeInSession) {
			setTheme(() => {
				document.body.setAttribute("data-theme", themeInSession);
				return themeInSession;
			});
		} else {
			document.body.setAttribute("data-theme", theme);
		}
    // eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
	<div className="flex min-h-screen w-screen flex-col">
		<ThemeContext.Provider value={{ theme, setTheme }}>
			<UserContext.Provider value={{ userAuth, setUserAuth }}>
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />}/>
					<Route path="/editor" element={<Editor />}/>
					<Route path="/editor/:blog_id" element={<Editor />}/>
					<Route path="dashboard" element={<SideNavbar />}>
						<Route path="blogs" element={<BlogsManagement />}/>
						<Route path="notifications" element={<Notifications />}/>
					</Route>
					<Route path="settings" element={<SideNavbar />}>
						<Route path="edit-profile" element={<EditProfile />}/>
						<Route path="change-password" element={<ChangePassword />} />
					</Route>
					<Route path="login" element={<UserAuthForm type="log-in" />}/>
					<Route path="signup" element={<UserAuthForm type="sign-up" />}/>
					<Route path="search/:query" element={<Search />}/>
					<Route path="user/:id" element={<Profile />}/>
					<Route path="blog/:blog_id" element={<BlogPage />}/>
					<Route path="*" element={<PageNotFound />}/>
				</Routes>
			</UserContext.Provider>
		</ThemeContext.Provider>
	</div>

	);
};

export default App;
