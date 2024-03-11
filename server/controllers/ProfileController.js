import User from "../Schema/User.js";
import bcrypt from "bcrypt";

let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

// SEARCH for profile
// app.post("/search-profile", (req, res) => {
export const searchProfile = (req, res) => {

	let { query } = req.body;

	User.find({ "personal_info.username": new RegExp(query, "i") })
		.limit(20)
		.select(
			"personal_info.fullname personal_info.username personal_info.profile_img -_id"
		)
		.then((users) => {
			return res.status(200).json({ users });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
};

// PROFLE
// app.post("/profile", (req, res) => {
export const profile = (req, res) => {

	let { username } = req.body;
	User.findOne({ "personal_info.username": username })
		.select("-personal_info.password -google_auth -updatedAt -blogs ")
		.then((user) => {
			return res.status(200).json(user);
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
};


// Change Password
// app.post("/change-password", userMiddleware, (req, res) => {
export const changePassword = (req, res) => {

	let { currentPassword, newPassword } = req.body;

	if (
		!passwordRegex.test(currentPassword) ||
		!passwordRegex.test(newPassword)
	) {
		return res.status(403).json({
			error:
				"Password should be 6 to 20 characters long with atleast 1 numeric, 1 lowercase and 1 uppercase letter",
		});
	}
	User.findOne({ _id: req.user })
		.then((user) => {
			if (user.google_auth) {
				return res.status(403).json({
					error:
						"Cannot change password because this account was created using google authentication",
				});
			}
			bcrypt.compare(
				currentPassword,
				user.personal_info.password,
				(err, result) => {
					if (err) {
						return res.status(500).json({
							error:
								"Error coccured while compairing passwords, please try again",
						});
					}
					if (!result) {
						return res
							.status(403)
							.json({ error: "Current password is incorrect" });
					}
					bcrypt.hash(newPassword, 10, (err, hashed_password) => {
						User.findOneAndUpdate(
							{ _id: req.user },
							{ "personal_info.password": hashed_password }
						)
							.then((u) => {
								return res
									.status(200)
									.json({ status: "Password changed successfully" });
							})
							.catch((err) => {
								return res.status(500).json({
									error:
										"Error occured while saving new password, please try again",
								});
							});
					});
				}
			);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: "User not found while updating password" });
		});
};

// Change Profile Image
// app.post("/change-profile-img", userMiddleware, (req, res) => {
export const changeProfileImg = (req, res) => {

	let { url } = req.body;
	User.findOneAndUpdate({ _id: req.user }, { "personal_info.profile_img": url })
		.then(() => {
			return res.status(200).json({ profile_img: url });
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
};

// Change Username , Bio and Links
// app.post("/update-profile", userMiddleware, (req, res) => {
export const updateProfile = (req, res) => {

	let { username, bio, social_links } = req.body;
	let bioLimit = 150;

	if (username.length < 3) {
		return res
			.status(403)
			.json({ error: "Username should at least have 3 characters" });
	}
	if (bio.length > bioLimit) {
		return res
			.status(403)
			.json({ error: `Bio should be less than ${bioLimit} characters` });
	}

	let socialLinkArray = Object.keys(social_links);
	try {
		for (let i = 0; i < socialLinkArray.length; i++) {
			if (social_links[socialLinkArray[i]].length) {
				let hostname = new URL(social_links[socialLinkArray[i]]).hostname;
				// hostname = https://github.com
				if (
					!hostname.includes(`${socialLinkArray[i]}.com`) &&
					socialLinkArray[i] != "website"
				) {
					return res
						.status(403)
						.json({ error: `Invalid ${socialLinkArray[i]} link.` });
				}
			}
		}
	} catch (err) {
		return res.status(500).json({
			error: "Please provide valid social links, starting with https",
		});
	}
	// create new entry in DB
	let updatedObj = {
		"personal_info.username": username,
		"personal_info.bio": bio,
		social_links,
	};
	User.findOneAndUpdate({ _id: req.user }, updatedObj, {
		runValidators: true,
	})
		.then(() => {
			return res.status(200).json({ username });
		})
		.catch((err) => {
			if (err.code == 11000) {
				return res.status(409).json({
					error: "Username is already taken, try using different username",
				});
			}
			return res.status(500).json({ error: err.message });
		});
};
