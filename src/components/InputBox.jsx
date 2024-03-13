import { useState } from "react";

export const InputBox = ({
	name,
	type,
	id,
	value,
	placeholder,
	icon,
	disable = false,
}) => {
	const [passwordVisibility, setPasswordVisibility] = useState(false);
	return (
		<div className="relative w-[100%] mb-4">
			<input
				name={name}
				type={
					type === "password"
						? passwordVisibility
							? "text"
							: "password"
						: type
				}
				defaultValue={value}
				id={id}
				disabled={disable}
				placeholder={placeholder}
				className="input-box"
			/>

			<i className={"fi " + icon + " input-icon"}></i>

			{type === "password" ? (
				<i
					className={"fi-rr-eye" + (!passwordVisibility ? "-crossed" : "") + " input-icon left-[auto] right-4 cursor-pointer"}
					onClick={() => setPasswordVisibility((currentVal) => !currentVal)}
				>
				</i>
			) : (
				""
			)}
		</div>
	);
};
