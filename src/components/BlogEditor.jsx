import { useNavigate, useParams } from "react-router-dom";
import { PageAnimation } from "../common/PageAnimation";
import lighBanner from "../imgs/blog-banner-light.png";
import darkBanner from "../imgs/blog-banner-dark.png";
import { UploadImage } from "../common/aws";
import { useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/Editor";
import EditorJS from "@editorjs/editorjs";
import { Tools } from "./Tools";
import axios from "axios";
import { ThemeContext, UserContext } from "../App";

export const BlogEditor = () => {
	let charLimit = 100;
	let {
		blog,
		blog: { title, banner, content, tags, desc },
		setBlog,
		textEditor,
		setTextEditor,
		setEditorState,
	} = useContext(EditorContext);

	let {
		userAuth: { token },
	} = useContext(UserContext);
	let { theme } = useContext(ThemeContext);
	let { blog_id } = useParams();

	let navigate = useNavigate();

	// AWS image upload
	const handelBannerUpload = (e) => {
		let img = e.target.files[0];
		if (img) {
			let loading = toast.loading("Uploading...");
			UploadImage(img)
				.then((url) => {
					if (url) {
						toast.dismiss(loading);
						toast.success("Uploaded");
						setBlog({ ...blog, banner: url });
					}
				})
				.catch((err) => {
					toast.dismiss(loading);
					return toast.error(err);
				});
		}
	};
	// Blog Title text area
	const handleKeydown = (e) => {
		if (e.keyCode === 13) {
			e.preventDefault();
		}
	};
	const handleTitleChange = (e) => {
		let input = e.target;
		input.style.height = "auto";
		input.style.height = input.scrollHeight + "px";

		setBlog({ ...blog, title: input.value });
	};
	const handleImgError = (e) => {
		let img = e.target;
		img.src = theme == "light" ? lighBanner : darkBanner;
	};

	const handleDescription = (e) => {
		let input = e.target.value;
		setBlog({ ...blog, desc: input });
	};

	// Text Editor
	useEffect(() => {
		if (!textEditor.isReady) {
			setTextEditor(
				new EditorJS({
					holder: "textEditor",
					data: Array.isArray(content) ? content[0] : content,
					tools: Tools,
					placeholder: "What's on your mind?",
				})
			);
		}
	}, []);

	// Upload/publish the blog
	const handlePublish = () => {
		if (!banner?.length) {
			return toast.error("Please upload blog banner to publish.");
		}
		if (!title?.length) {
			return toast.error("Please provide blog title.");
		}
		if (!desc.length || desc.length > charLimit) {
			return toast.error(
				`Please add caption`
			);
		}
		// description (desc)
		if (textEditor.isReady) {
			textEditor
				.save()
				.then((data) => {
					if (data.blocks.length) {
						setBlog({ ...blog, content: data });
						setEditorState("publish");
					} else {
						return toast.error(
							"Please add description "
						);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	};

	// Draft
	const handleDraft = (e) => {
		// frontend validations
		if (e.target.className.includes("disable")) {
			return;
		}
		if (!title?.length) {
			return toast.error("Please add blog title to save as draft");
		}

		// loader
		let loading = toast.loading("Saving draft...");
		e.target.classList.add("disable");

		if (textEditor.isReady) {
			textEditor.save().then((content) => {
				let blogContent = { title, desc, banner, content, tags, draft: true };

				// server req
				axios
					.post(
						import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
						{ ...blogContent, id: blog_id },
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					)
					.then(() => {
						e.target.classList.remove("disable");
						toast.dismiss(loading);
						toast.success("Saved as draft");

						// navigate to dashboard page instead of Home page
						setTimeout(() => {
							navigate("/dashboard/blogs?tab=draft");
						}, 500);
					})
					.catch(({ response }) => {
						e.target.classList.remove("disable");
						toast.dismiss(loading);
						return toast.error(response.data.error);
					});
			});
		}
	};

	return (
		<>
			<nav className="navbar">
				<p className="text-xl text-black line-clamp-1 w-full">
					{title?.length ? title : "New Blog"}
				</p>
				<div className="flex gap-4 ml-auto">
					<button className="btn-dark py-2" onClick={handlePublish}>
						Publish
					</button>
					<button className="btn-light py-2" onClick={handleDraft}>
						Save draft
					</button>
				</div>
			</nav>
			<Toaster />
			<PageAnimation>
				<section>
					<div className="mx-auto max-w-[900px] w-full">
						<div className="relative aspect-video bg-white border-2 border-grey hover:opacity-80">
							<label htmlFor="uploadBanner">
								<img
									src={banner}
									onError={handleImgError}
									className="z-20 cursor-pointer"
								/>

								<input
									id="uploadBanner"
									type="file"
									accept=".png, .jpg, .jpeg"
									hidden
									onChange={handelBannerUpload}
								/>
							</label>
						</div>
						<textarea
							defaultValue={title}
							placeholder="Blog Title"
							className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white"
							onKeyDown={handleKeydown}
							onChange={handleTitleChange}
						></textarea>
						<hr className="w-full opacity-10 my-5 " />

						<p className="text-dark-grey mb-2 mt-9">Caption</p>
						<textarea
							className="resize-none h-20 leading-7 input-box pl-4"
							defaultValue={desc}
							maxLength={charLimit}
							onChange={handleDescription}
							onKeyDown={handleKeydown}
						></textarea>
						<p className="mt-1 text-dark-grey text-sm text-right">
							{charLimit - desc.length} Characters left
						</p>
						<p className="text-dark-grey mb-2 mt-9">Description</p>
						<div id="textEditor" className="font-gelasio"></div>
					</div>
				</section>
			</PageAnimation>
		</>
	);
};
