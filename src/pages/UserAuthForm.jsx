import { Link, Navigate } from "react-router-dom";
import { InputBox } from "../components/InputBox";
import { PageAnimation } from "../common/PageAnimation";
import googleIcon from "../imgs/google.png";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { useContext, useRef } from "react";
import { authWithGoogle } from "../common/firebase";

export const UserAuthForm = ({ type }) => {
	// const authForm = useRef();
	let {
		userAuth: { token },
		setUserAuth,
	} = useContext(UserContext);

	const apiRequest = (serverRoute, formData) => {
		axios
			.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
			.then(({ data }) => {
				storeInSession("user", JSON.stringify(data));
				setUserAuth(data);
			})
			.catch(({ response }) => {
				toast.error(response?.data?.error);
			});
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		let serverRoute = type == "log-in" ? "/login" : "/signup";
		let form = new FormData(formElement);
		let formData = {};

		for (let [key, value] of form.entries()) {
			formData[key] = value;
		}

		// VALIDATION
		let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
		let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

		let { fullname, email, password } = formData;
		if (fullname) {
			if (fullname.length < 3) {
				return toast.error("Fullname must have at least 3 letters");
			}
		}
		if (!email || !password) {
			return toast.error("Please fill all fields");
		}
		if (!email.length) {
			return toast.error("Please provide email");
		}
		if (!emailRegex.test(email)) {
			return toast.error("Invalid email address");
		}
		if (!passwordRegex.test(password)) {
			return toast.error(
				"Password should be 6 to 20 characters long having at least a numeric, lowercase and uppercase letter"
			);
		}

		apiRequest(serverRoute, formData);
	};

	const handleGoogleAuth = (e) => {
		e.preventDefault();
		authWithGoogle()
			.then((user) => {
				let serverRoute = "/google-auth";
				let formData = { token: user?.accessToken };
				apiRequest(serverRoute, formData);
			})
			.catch((err) => {
				toast.error("Trouble in logging with google, please try again.");
				return console.log(err);
			});
	};

	return token ? (
		<Navigate to="/" />
	) : (
		<PageAnimation keyValue={type}>
			<section className="h-cover flex items-center justify-center">
				<Toaster />
				<form id="formElement" className="w-[80%] max-w-[400px]">
					<h1 className="text-4xl font-gelasio capitalize text-center mb-24">
						{type == "log-in"
							? "Welcome Back"
							: "Join the community today"}
					</h1>
					{type !== "log-in" ? (
						<InputBox name="fullname" type="text" placeholder="Full Name" />
					) : (
						""
					)}

					<InputBox name="email" type="email " placeholder="Email" />

					<InputBox name="password" type="password" placeholder="Password" />
					<button
						className="btn-dark center mt-14 w-full rounded-md"
						type="submit"
						onClick={handleSubmit}
					>
						{type.replace("-", " ")}
					</button>

					<div className="w-full items-center flex gap-2 my-10 opacity-10 uppercase text-black font-bold">
						<hr className="w-1/2 border-black"></hr>
						<p>or</p>
						<hr className="w-1/2 border-black"></hr>
					</div>

					<button
						className="btn-dark flex items-center justify-center gap-4 center w-full rounded-md"
						onClick={handleGoogleAuth}
					>
						<img src={googleIcon} className="w-5"></img>
						Continue with google
					</button>

					{type == "log-in" ? (
						<p className="mt-6 text-dark-grey text-xl text-center">
							Don't have an account?
							<Link to="/signup" className="underline text-black text-xl ml-1">
								Create account
							</Link>
						</p>
					) : (
						<p className="mt-6 text-dark-grey text-xl text-center">
							Already have an account?
							<Link to="/login" className="underline text-black text-xl ml-1">
								Log in
							</Link>
						</p>
					)}
				</form>
			</section>
		</PageAnimation>
	);
};
