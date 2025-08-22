import { DynamicImage, Image } from '@solid-mediakit/og'
import { createResource } from 'solid-js';
declare module "solid-js" {
	namespace JSX {
		interface HTMLAttributes<T> {
			tw?: string;
		}
	}
}
export default function SolidBase() {
	const [user] = createResource(async () => {
		const data = await (await fetch("https://randomuser.me/api/")).json();
		return data.results[0].name.first
	}, { deferStream: true })
	return (
		<div>
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
						{`👋 Hello, ${user()}!`}
					</div>
				</DynamicImage>
			</Image>
		</div>
	)
}
