import { createSignal } from "solid-js";
import "./Counter.css";

export default function Counter(props: {
	count: number;
	setCount: (n: number) => void;
}) {
	return (
		<button class="increment" onClick={() => props.setCount(props.count + 1)}>
			Clicks: {props.count}
		</button>
	);
}
