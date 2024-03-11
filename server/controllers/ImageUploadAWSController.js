import { nanoid } from "nanoid"; // adds random string to username

// AWS
import aws from "aws-sdk";
const s3 = new aws.S3({
	region: "ap-south-1",
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Upload image to AWS ( unique => uuid-timestamp.jpeg )
const generateUploadURL = async () => {
	const date = new Date();
	const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

	return await s3.getSignedUrlPromise("putObject", {
		Bucket: "socialmediadb",
		Key: imageName,
		Expires: 1000,
		ContentType: "image/jpeg",
	});
};

// AWS image upload url route
// app.get("/get-upload-url", (req, res) => {
export const getUploadUrl = (req, res) => {
	generateUploadURL()
		.then((url) => {
			res.status(200).json({ uploadURL: url });
		})
		.catch((err) => {
			console.log(err.message);
			return res.status(500).json({ error: err.message });
		});
};
