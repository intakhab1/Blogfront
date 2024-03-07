import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./Profile";
import { PageAnimation } from "../common/PageAnimation";
import Loader from "../components/Loader";
import toast, { Toaster } from "react-hot-toast";
import { InputBox } from "../components/InputBox";
import { UploadImage } from "../common/aws";
import { storeInSession } from "../common/session";

export const EditProfile = () => {
	let {
		userAuth,
		userAuth: { token },
		setUserAuth,
	} = useContext(UserContext);
	let bioLimit = 150;
	let profileImgElement = useRef();
	let editProfileForm = useRef();

	const [profile, setPorfile] = useState(profileDataStructure);
	const [loading, setLoading] = useState(true);
	const [charactersLeft, setCharactersLeft] = useState(bioLimit);
	const [selectedProfileImg, setSelectedProfileImg] = useState(null);

	let {
		personal_info: {
			fullname,
			username: profile_username,
			profile_img,
			email,
			bio,
		},
		social_links,
	} = profile;

	useEffect(() => {
		if (token) {
			axios
				.post(import.meta.env.VITE_SERVER_DOMAIN + "/profile", {
					username: userAuth.username,
				})
				.then(({ data }) => {
					// console.log(data);
					setPorfile(data);
					setLoading(false);
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, [token]);

	const handleCharacterChange = (e) => {
		setCharactersLeft(bioLimit - e.target.value.length);
	};

	const handleImgPreview = (e) => {
		let img = e.target.files[0];
		profileImgElement.current.src = URL.createObjectURL(img);
		setSelectedProfileImg(img);
	};

	const handleImgUpload = (e) => {
		e.preventDefault();
		if (selectedProfileImg) {
			let loadingToast = toast.loading("Uploading...");
			e.target.setAttribute("disabled", true);

			// send selected img to aws
			UploadImage(selectedProfileImg)
				.then((url) => {
					// insert updated img link from aws in DB
					if (url) {
						axios
							.post(
								import.meta.env.VITE_SERVER_DOMAIN + "/change-profile-img",
								{ url },
								{
									headers: {
										Authorization: `Bearer ${token}`,
									},
								}
							)
							.then(({ data }) => {
								// update profile img in the session storage
								let newUserAuth = {
									...userAuth,
									profile_img: data.profile_img,
								};
								storeInSession("user", JSON.stringify(newUserAuth));
								setUserAuth(newUserAuth);

								setSelectedProfileImg(null);

								toast.dismiss(loadingToast);
								e.target.removeAttribute("disabled");
								toast.success("Profile image updated successfully");
							})
							.catch(({ response }) => {
								toast.dismiss(loadingToast);
								e.target.removeAttribute("disabled");
								toast.error(response.data.error);
							});
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		let form = new FormData(editProfileForm.current);
		let formData = {};
		for (let [key, value] of form.entries()) {
			formData[key] = value;
		}
		let {
			username,
			bio,
			youtube,
			facebook,
			twitter,
			github,
			instagram,
			website,
		} = formData;

		if (username.length < 3) {
			return toast.error("Username should at least have 3 characters");
		}
		if (bio.length > bioLimit) {
			return toast.error(`Bio should be less than ${bioLimit} characters`);
		}

		let loadingToast = toast.loading("Uploading...");
		e.target.setAttribute("disabled", true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile", {username, bio, social_links: { youtube, facebook, twitter, github, instagram, website }}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(({ data }) => {
        	// update profile in the session storage

            if(userAuth.username != data.username){
                let newUserAuth = { ...userAuth, username: data.username }
                storeInSession("user", JSON.stringify(newUserAuth))
                setUserAuth(newUserAuth)

                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                toast.success("Profile updated successfully");
            }
        })
        .catch(({ response }) => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            toast.error(response.data.error);
        });
	};

	return (
		<PageAnimation>
			{loading ? (
				<Loader />
			) : (
				<form ref={editProfileForm}>
					<Toaster />
					<h1 className="max-md:hidden">Edit Profile</h1>
					<div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
						<div className="max-lg:center mb-5">
							<label
								htmlFor="uploadImg"
								id="profileImgLabel"
								className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden  "
							>
								<div className="absolute flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 w-full h-full top-0 left-0  ">
									Upload image
								</div>
								<img src={profile_img} ref={profileImgElement} />
							</label>
							<input
								type="file"
								id="uploadImg"
								accept=".jpeg, .png, .jpg"
								hidden
								onChange={handleImgPreview}
							/>
							<button
								onClick={handleImgUpload}
								className="btn-light mt-5 max-lg:center lg:w-full px-10"
							>
								Upload
							</button>
						</div>
						<div className="w-full">
							<div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
								<div>
									<InputBox
										name="fullname"
										type="text"
										value={fullname}
										placeholder="Fullname"
										disable={true}
										icon="fi-rr-user"
									/>
								</div>
								<div>
									<InputBox
										name="email"
										type="email"
										value={email}
										placeholder="Email"
										disable={true}
										icon="fi-rr-envelope"
									/>
								</div>
							</div>
							<InputBox
								type="text"
								name="username"
								value={profile_username}
								placeholder="Username"
								icon="fi-rr-at"
							/>
							<p className="text-dark-grey mt-3">
								Your username is public and you can search others by there
								username.
							</p>
							<textarea
								name="bio"
								maxLength={bioLimit}
								defaultValue={bio}
								placeholder="Bio"
								onChange={handleCharacterChange}
								className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5 "
							></textarea>
							<p className="mt-1 text-dark-grey">
								{charactersLeft} characters left
							</p>
							<p className="my-6 text-dark-grey">
								Add other social media links
							</p>
							<div className="md:grid md:grid-cols-2 gap-x-6">
								{Object.keys(social_links).map((key, i) => {
									let link = social_links[key];
									return (
										<InputBox
											key={i}
											name={key}
											type="text"
											value={link}
											placeholder="https://"
											icon={
												"fi " +
												(key != "website" ? "fi-brands-" + key : "fi-rr-globe")
											}
										/>
									);
								})}
							</div>
							<button
								className="btn-dark w-auto px-10"
								type="submit"
								onClick={handleSubmit}
							>
								Update
							</button>
						</div>
					</div>
				</form>
			)}
		</PageAnimation>
	);
};
