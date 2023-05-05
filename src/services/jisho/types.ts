export type JishoResponse = {
	words?: {
		furigana: string;
		kanji: string;
		entries: [
			{
				tag: string;
				definitions: { meaning: string; additionalInfo: string }[];
			}
		];
	}[];
	kanjis?: { kanji: string; meanings: string; kun: string; on: string }[];
};
