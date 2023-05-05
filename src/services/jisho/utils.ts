import type { JishoResponse } from "./types";

export function parseDom(page: Document): JishoResponse {
	return {
		words: getWords(page),
		kanjis: getKanjis(page),
	};
}

function getWords(page: Document) {
	const res = [];
	const words = page.querySelectorAll("#primary .concept_light");

	words.forEach((wordEl) => {
		let word = { entries: [], furigana: "", kanji: "" };

		word.furigana = wordEl.querySelector(".furigana")?.textContent.trim() || "";
		word.kanji = wordEl.querySelector(".text")?.textContent.trim() || "";

		let defs = {};
		wordEl.querySelectorAll(".meaning-tags").forEach((tag) => {
			const defEl = tag.nextElementSibling.children[0];
			let def = { tag: "", meaning: "", additionalInfo: "" };

			def.tag = tag.textContent.trim();

			if (def.tag !== "Notes" && def.tag !== "Other forms") {
				def.meaning = defEl.children[1].textContent.trim();
				def.additionalInfo = defEl.children[3]?.textContent.trim() || null;
			} else {
				def.meaning = defEl.textContent.trim();
				def.additionalInfo = null;
			}
			defs[def.tag] ? defs[def.tag].push(def) : (defs[def.tag] = [def]);
		});

		for (const [tag, def] of Object.entries(defs)) {
			word.entries.push({ tag, definitions: def });
		}

		res.push(word);
	});

	return res;
}

function getKanjis(page: Document) {
	const res = [];
	const kanjis = page.querySelectorAll("#secondary .kanji_light");

	const trim = (kanji: HTMLElement | undefined) => {
		if (!kanji) return "";
		return kanji.textContent.trim().replaceAll("/\ns+/g", "");
	};
	kanjis.forEach((kanji) => {
		const entry = { kanji: "", meanings: "", kun: "", on: "" };

		entry.kanji = trim(kanji.querySelector(".literal"));
		entry.meanings = trim(kanji.querySelector(".meanings"));
		entry.kun = trim(kanji.querySelector(".kun.readings"));
		entry.on = trim(kanji.querySelector(".on.readings"));

		res.push(entry);
	});

	return res;
}
