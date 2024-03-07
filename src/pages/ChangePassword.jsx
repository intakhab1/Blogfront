import React, { useContext, useRef } from "react";
import { PageAnimation } from "../common/pageAnimation";
import { InputBox } from "../components/InputBox";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";

export const ChangePassword = () => {
	let {
		userAuth: { token },
	} = useContext(UserContext);

	let changePasswordForm = useRef();
	let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

	const handleSubmit = (e) => {
		e.preventDefault();
		let form = new FormData(changePasswordForm.current);
		let formData = {};
		for (let [key, value] of form.entries()) {
			formData[key] = value;
		}
		let { currentPassword, newPassword } = formData;
		if (!currentPassword.length || !newPassword.length) {
			return toast.error("Fill all fields");
		}
		if (
			!passwordRegex.test(currentPassword) ||
			!passwordRegex.test(newPassword)
		) {
			return toast.error(
				"Password should be 6 to 20 characters long with atleast 1 numeric, 1 lowercase and 1 uppercase letter"
			);
		}

		e.target.setAttribute("disabled", true); // preventing multiple req send to server
		let loadingToast = toast.loading("Updating...");

		axios
			.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then(() => {
				toast.dismiss(loadingToast);
				e.target.removeAttribute("disabled");
				return toast.success("Password updated successfully");
			})
			.catch(({ response }) => {
				toast.dismiss(loadingToast);
				e.target.removeAttribute("disabled");
				return toast.error(response.data.error);
			});
	};

	return (
		<PageAnimation>
			<Toaster />
			<form ref={changePasswordForm}>
				<h1 className="max-md:hidden">Change Password</h1>
				<div className="py-10 w-full md-max-w-[400px] ">
					<InputBox
						name="currentPassword"
						type="password"
						className="profile-edit-input"
						placeholder="Current Password"
						icon="fi-rr-unlock"
					/>
					<InputBox
						name="newPassword"
						type="password"
						className="profile-edit-input"
						placeholder="New Password"
						icon="fi-rr-unlock"
					/>
					<button
						onClick={handleSubmit}
						className="btn-dark px-10 "
						type="submit"
					>
						Change Password
					</button>
				</div>
			</form>
		</PageAnimation>
	);
};
