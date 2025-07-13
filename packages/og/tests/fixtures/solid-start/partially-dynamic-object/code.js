import { createSignal } from "solid-js";

const [signal] = createSignal("hello")
const coolVar = <DynamicImage yes="123"><div class={{fontSize: "100px", [signal()]: "123"}}>{}</div></DynamicImage>;