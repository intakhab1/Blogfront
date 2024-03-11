import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../Schema/User.js";
import { nanoid } from "nanoid";

dotenv.config();

// // google auth
// import admin from "firebase-admin";
// import serviceAccountKey from "../socialmedia-d41db-firebase-adminsdk-pt12x-eed21b8002.json" assert { type: "json" };
// import { getAuth } from "firebase-admin/auth";
// admin.initializeApp({
// 	credential: admin.credential.cert(serviceAccountKey),
// });

// functions
const generateUniqueUsername = async (email) => {
	let username = email.split("@")[0];
	let isUsernameNotExists = await User.exists({
		"personal_info.username": username,
	}).then((result) => result);
	isUsernameNotExists ? (username += nanoid().substring(0, 4)) : "";
	return username;
};
// Generate token
const formatDataToSend = (user) => {
	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
	// const payload = {
	// 	email: user.personal_info.email,
	// 	id: user._id,
	// };
	// const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
	// 	expiresIn: "168h",
	// });

	return {
		token,
		profile_img: user.personal_info.profile_img,
		username: user.personal_info.username,
		fullname: user.personal_info.fullname,
	};
};

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password


// SIGNUP
// app.post("/signup", (req, res) => {
export const signup = (req, res) => {
	let { fullname, email, password } = req.body;
	// validations
	if (fullname.length < 3) {
		return res.status(403).json({
			success: false,
			error: "Fullname must have at least 3 letters",
		});
	}
	if (!email.length) {
		return res.status(403).json({
			success: false,
			error: "Please provide email",
		});
	}
	if (!emailRegex.test(email)) {
		return res.status(403).json({
			success: false,
			error: "Invalid email",
		});
	}
	if (!passwordRegex.test(password)) {
		return res.status(403).json({
			success: false,
			error:
				"Password should be 6 to 20 characters long having at least a numeric, lowercase and uppercase letter",
		});
	}

	bcrypt.hash(password, 10, async (err, hashed_password) => {
		let username = await generateUniqueUsername(email);
		let user = new User({
			personal_info: { fullname, email, password: hashed_password, username },
		});
		user
			.save()
			.then((u) => {
				return res.status(200).json(formatDataToSend(u));
			})
			.catch((err) => {
				if (err.code == 11000) {
					return res.status(500).json({ error: "Email already exists" });
				}
				return res.status(500).json({
					success: false,
					error: err.message,
				});
			});
	});
};
// LOGIN
// app.post("/login", (req, res) => {
export const login = (req, res) => {   
	let { email, password } = req.body;

	User.findOne({ "personal_info.email": email })
		.then((user) => {
			if (!user) {
				return res.status(403).json({
					error: "Email is not Registered, please Sign up to Continue`",
				});
			}
			// google auth
			if (!user.google_auth) {
				// compare with existing password
				bcrypt.compare(
					password,
					user.personal_info.password,
					(err, passwordCheck) => {
						if (err) {
							return res.status(403).json({
								success: false,
								error: "Error occured while logging, please try again",
							});
						}
						if (!passwordCheck) {
							return res.status(403).json({
								success: false,
								error: "Incorrect password",
							});
						} else {
							return res.status(200).json(formatDataToSend(user));
						}
					}
				);
			} else {
				return res.status(403).json({
					success: false,
					error:
						"This account was created using google, please try logging in with google",
				});
			}
		})
		.catch((err) => {
			console.log(err.message);
			return res.status(500).json({ error: err.message });
		});
};
// GOOGLE AUTH
// app.post("/google-auth", async (req, res) => {
export const googleAuth = async (req, res) => {
	let { token } = req.body;
	getAuth()
		.verifyIdToken(token)
		.then(async (goggleUser) => {
			let { email, name, picture } = goggleUser;
			picture = picture.replace("s96-c", "s384-c"); // increasing img resolution

			// check if username exists in db if yes then login else sign up
			let user = await User.findOne({ "personal_info.email": email })
				.select(
					"personal_info.fullname personal_info.username personal_info.profile_img google_auth"
				)
				.then((u) => {
					return u || null;
				})
				.catch((error) => {
					return res.status(500).json({ error: error.message });
				});

			// Already sign up without google
			if (user) {
				if (!user.google_auth) {
					return res.status(403).json({
						error:
							"This account was created without google, please try log in using email and password",
					});
				}
			} else {
				// sign up using google
				let username = await generateUniqueUsername(email);
				user = new User({
					personal_info: {
						fullname: name,
						email,
						profile_img: picture,
						username,
					},
					google_auth: true,
				});
				await user
					.save()
					.then((u) => {
						user = u;
					})
					.catch((err) => {
						return res.status(500).json({ error: err.message });
					});
			}
			return res.status(200).json(formatDataToSend(user));
		})
		.catch((err) => {
			return res
				.status(500)
				.json({ error: "Authentication falied, please try again." });
		});
};