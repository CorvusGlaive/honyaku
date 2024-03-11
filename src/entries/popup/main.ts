import { mount } from "svelte";
import Popup from "./Popup.svelte";

mount(Popup, {
	target: document.getElementById("app") as Node,
});
