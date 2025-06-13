import { DynamicImage, Image } from "@solid-mediakit/og";
import { createSignal } from "solid-js";

export function Component() {
	const [count, setCount] = createSignal(0);
	return <div>
		<Image>
			<DynamicImage>
				<div
					style={{
						width: '100%',
						height: '100%',
						display: 'flex',
						'align-items': 'center',
						'justify-content': 'center',
						'font-size': '128px',
						background: 'lavender',
					}}
				>
					{`👋 Hello, ${count() * 2}!`}
				</div>
			</DynamicImage>
		</Image>
		<button
			onClick={() => {
				setCount(c => c += 1) // The component above automatically detects this change,
				// and the image will rerender on the client
			}}
		>
			Increment
		</button>
	</div>
}