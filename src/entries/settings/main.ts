import { tabs } from "webextension-polyfill";
import App from "./Settings.svelte";

const searchParams = new URL(document.URL).searchParams;
const audioUrl = searchParams.get("audio");

for (const [key, value] of searchParams.entries()) {
  console.log(`Options:searchParams: ${key} = ${value}`);
}

if (audioUrl) {
  playAudio();
} else {
  new App({
    target: document.getElementById("app"),
  });
}

async function playAudio() {
  document.title = "Audio playback";
  document.documentElement.style.backgroundColor = "black";
  document.documentElement.classList.add("dark");

  const currentTab = await tabs.getCurrent();
  const audio = new Audio(audioUrl);
  audio.play();

  tabs.update(currentTab.openerTabId, { active: true });
  audio.addEventListener("ended", () => {
    tabs.remove(currentTab.id);
  });
}
