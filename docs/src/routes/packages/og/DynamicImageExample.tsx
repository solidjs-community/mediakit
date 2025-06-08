import { DynamicImage, Image } from "@solid-mediakit/og";
import { createSignal } from "solid-js";
import notoSans from "../../../../node_modules/@vercel/og/dist/noto-sans-v27-latin-regular.ttf?arraybuffer"
import { isServer } from "solid-js/web";
import { prerenderDynamicImage } from "@solid-mediakit/og/server/prerender"
const fonts = [
	{
		name: "Noto Sans",
		weight: 500,
		data: notoSans,
	}
]

export function Component() {
	const [count, setCount] = createSignal(0);
	// if (import.meta.nitro && isServer) {
	// 	(async () => {
	// 		// Fun hack!
	// 		await prerenderDynamicImage(DynamicImage1ServerFunction)
	// 	})()
	// }
	return <div>
		<Image>
			<DynamicImage imageOptions={{ fonts }}>
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