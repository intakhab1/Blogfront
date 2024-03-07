import { Toaster, toast } from "react-hot-toast";
import { PageAnimation } from "../common/PageAnimation";
import { EditorContext } from "../pages/Editor";
import { useContext } from "react";
import { Tags } from "./Tags";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";

export const PublishForm = () => {
	let { blog_id } = useParams();
	let navigate = useNavigate();
	let charLimit = 100;
	let tagLimit = 5;

	let {
		setEditorState,
		blog,
		blog: { banner, title, tags, desc, content },
		setBlog,
	} = useContext(EditorContext);
	let {
		userAuth: { token },
	} = useContext(UserContext);
	const handleClose = () => {
		setEditorState("editor");
	};

	// publish blog
	const handlePublishBlog = (e) => {
		// frontend validations
		if (e.target.className.includes("disable")) {
			return;
		}
		if (!title.length) {
			return toast.error("Please add blog title");
		}
		if (!banner.length) {
			return toast.error("Please add blog banner");
		}
		// if (!tags.length) {
		// 	return toast.error("Please add a blog tag");
		// }
		// loader
		let loading = toast.loading("Publishing...");
		e.target.classList.add("disable");

		let blogContent = { title, desc, banner, content, tags, draft: false };
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
				toast.success("Published");

				// TODO -> navigate to dashboard page instead of Home page
				setTimeout(() => {
					navigate("/dashboard/blogs");
				}, 500);
			})
			.catch(({ response }) => {
				e.target.classList.remove("disable");
				toast.dismiss(loading);
				return toast.error(response.data.error);
			});
	};

	// title, desc, tags change
	const hanldeTitleChange = (e) => {
		let input = e.target.value;
		setBlog({ ...blog, title: input });
	};
	const handleDescription = (e) => {
		let input = e.target.value;
		setBlog({ ...blog, desc: input });
	};
	const handleKeydown = (e) => {
		if (e.keyCode === 13) {
			e.preventDefault();
		}
	};
	const handleKeydownTags = (e) => {
		if (e.keyCode === 13 || e.keyCode === 188) {
			e.preventDefault();

			let tag = e.target.value;
			if (tags.length < tagLimit) {
				if (!tags.includes(tag) && tag.length) {
					setBlog({ ...blog, tags: [...tags, tag] });
				}
			} else {
				toast.error(`Maximum tag limit is ${tagLimit}`);
			}
			e.target.value = "";
		}
	};

	return (
		<PageAnimation>
			<section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
				<Toaster />
				<button
					className="w-12 h-12 absolute right-[5vw] z-10 top-[15%]"
					onClick={handleClose}
				>
					<i className="fi fi-br-cross text-xl font-bold"></i>
				</button>
				<div className="max-w-[550px] center ">
					<p className="text-dark-grey mb-8 -mt-7 text-2xl font-bold">Preview</p>
					<div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
						<img src={banner} />
					</div>
					<h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
						{title}
					</h1>
					<p className="font-gelasio line-clamp-2 text-xl mt-4 leading-7">
						{desc}
					</p>
				</div>
				<div className="border-grey lg:border-1 lg:pl-8">
					<p className="text-dark-grey mb-2 mt-9">Blog Title</p>
					<input
						className="input-box pl-4"
						type="text"
						placeholder="Blog Title"
						defaultValue={title}
						onChange={hanldeTitleChange}
					/>
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
					<p className="text-dark-grey mb-2 mt-9">
						Tags - (Ex: tech, food, travel, etc. For better reach){" "}
					</p>
					<div className="relative input-box pl-2 py-2 pb-4">
						<input
							type="text"
							placeholder="Tag"
							className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
							onKeyDown={handleKeydownTags}
						/>
						{tags.map((tag, i) => {
							return <Tags tag={tag} key={i} tagIndex={i} />;
						})}
					</div>
					<p className="mt-1 mb-4 text-dark-grey text-right">
						{tagLimit - tags.length} Tags left
					</p>
					<button className="btn-dark px-8 " onClick={handlePublishBlog}>
						Publish
					</button>
				</div>
			</section>
		</PageAnimation>
	);
};
