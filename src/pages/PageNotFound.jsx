import { Link } from "react-router-dom";
import lightPageNotFoundImg from "../imgs/404-light.png";
import darkPageNotFoundImg from "../imgs/404-dark.png";
import lightFullLogo from "../imgs/full-logo-light.png"
import darkFullLogo from "../imgs/full-logo-dark.png"
import { useContext } from "react";
import { ThemeContext } from "../App";

export const PageNotFound = () => {
	let { theme } = useContext(ThemeContext);
	return (
		<section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center ">
			<img
				src={theme == "light" ? darkPageNotFoundImg : lightPageNotFoundImg}
				className="select-none border-2 border-grey w-72 aspect-square object-cover rounded"
			/>
			<h1 className="font-gelasio leadind-7 -mt-8 text-4xl">Page not found</h1>
			<p className="text-xl text-dark-grey leading-7">
				Page does not exist, please go to{" "}
				<Link to="/" className="text-black underline">
					home page
				</Link>{" "}
			</p>
			<div className="mt-auto">
				<img
					src={theme == 'light' ? darkFullLogo : lightFullLogo }
					className="object-contain h-8 block mx-auto select-none"
				/>
				<p className="text-dark-grey mt-5">
					Forging friendships, sharing knowledge – because the best stories
					unfold together."
				</p>
			</div>
		</section>
	);
};
