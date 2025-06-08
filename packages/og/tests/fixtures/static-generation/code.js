import { createSignal } from "solid-js";

const [signal] = createSignal("")
const coolVar = <DynamicImage yes="123"><div>{signal()}</div></DynamicImage>;