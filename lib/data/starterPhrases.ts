// Starter phrases shown on the onboarding screen.
// `speechText` is hidden Chinese text used ONLY for audio. Never render it in the UI.
export type StarterPhrase = { pinyin: string; meaning: string; speechText: string };

export const STARTER_PHRASES: StarterPhrase[] = [
  { pinyin: "nǐ hǎo", meaning: "hello", speechText: "你好" },
  { pinyin: "nǐ hǎo ma", meaning: "how are you?", speechText: "你好吗" },
  { pinyin: "wǒ hěn hǎo", meaning: "I am very well", speechText: "我很好" },
  { pinyin: "xièxie", meaning: "thank you", speechText: "谢谢" },
  { pinyin: "bú kèqi", meaning: "you're welcome", speechText: "不客气" },
  { pinyin: "zàijiàn", meaning: "goodbye", speechText: "再见" },
  { pinyin: "duìbuqǐ", meaning: "sorry", speechText: "对不起" },
  { pinyin: "nǐ jiào shénme míngzi", meaning: "what is your name?", speechText: "你叫什么名字" },
  { pinyin: "wǒ bù chī", meaning: "I don't eat / I don't want to eat", speechText: "我不吃" },
  { pinyin: "wǒ bú qù", meaning: "I'm not going", speechText: "我不去" },
  { pinyin: "wǒ méiyǒu chī píngguǒ", meaning: "I didn't eat the apple", speechText: "我没有吃苹果" },
  { pinyin: "nǐ xǐhuān zhōngwén ma", meaning: "do you like Chinese?", speechText: "你喜欢中文吗" },
  { pinyin: "wǒ xǐhuān zhōngwén", meaning: "I like Chinese", speechText: "我喜欢中文" },
  { pinyin: "nǐ zěnme qù", meaning: "how are you going?", speechText: "你怎么去" },
];

// Extra wrong answers for review games when the learner has few phrases.
export const FILLER_MEANINGS = [
  "good morning",
  "I am hungry",
  "where is the bathroom?",
  "how much is it?",
  "I don't understand",
  "see you tomorrow",
  "I want some water",
  "nice to meet you",
];
