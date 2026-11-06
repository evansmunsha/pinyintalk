export type PhraseDTO = {
  id: string;
  pinyin: string;
  meaning: string;
  note: string | null;
  speechText: string | null;
};

export type MeiReply = {
  pinyin: string;
  speech?: string;
  english: string;
  note: string;
  newPhrase?: { pinyin: string; meaning: string; speech?: string } | null;
};
