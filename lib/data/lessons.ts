// Lesson and listening-drill content. Pinyin and English are shown in the app.
// `speech` / `speechText` / `titleChinese` hold Chinese characters used ONLY to make audio. Never render them.
// To add a lesson or drill: add an entry here. It is saved to the database automatically the next time /learn is opened.

export type Vocab = { pinyin: string; meaning: string; speech: string };

export type LessonSeed = {
  key: string;
  title: string; // pinyin
  titleEnglish: string;
  titleChinese: string; // hidden
  theme: string;
  description: string;
  level: "beginner" | "intermediate";
  objectives: string[];
  vocabulary: Vocab[];
  order: number;
  isActive: boolean;
};

export type DrillSeed = {
  lessonKey: string;
  title: string; // pinyin
  titleEnglish: string;
  titleChinese: string; // hidden
  transcript: string; // hidden Chinese, used only for audio
  transcriptPinyin: string;
  level: "beginner" | "intermediate";
  questions: { text: string; options: string[]; correctAnswer: number }[];
};

export const LESSONS: LessonSeed[] = [
  {
    key: "tones",
    title: "Shēngdiào",
    titleEnglish: "Tones",
    titleChinese: "声调",
    theme: "tones",
    description:
      "Mandarin has four tones plus a neutral tone. First is flat and high (mā), second rises (má), third dips then rises (mǎ), fourth falls sharply (mà). Play each one and repeat it.",
    level: "beginner",
    objectives: ["Hear the four tones", "Tell mā, má, mǎ and mà apart"],
    order: 1,
    isActive: true,
    vocabulary: [
      { pinyin: "mā", meaning: "mom (first tone, flat and high)", speech: "妈" },
      { pinyin: "má", meaning: "hemp (second tone, rising)", speech: "麻" },
      { pinyin: "mǎ", meaning: "horse (third tone, dip then rise)", speech: "马" },
      { pinyin: "mà", meaning: "to scold (fourth tone, falling)", speech: "骂" },
    ],
  },
  {
    key: "small-talk",
    title: "Xiánliáo",
    titleEnglish: "Small talk",
    titleChinese: "闲聊",
    theme: "small-talk",
    description: "Greet people, ask how they are and say your name.",
    level: "beginner",
    objectives: ["Say hello and goodbye", "Ask and say your name", "Ask how someone is"],
    order: 2,
    isActive: true,
    vocabulary: [
      { pinyin: "nǐ hǎo", meaning: "hello", speech: "你好" },
      { pinyin: "nǐ hǎo ma", meaning: "how are you?", speech: "你好吗" },
      { pinyin: "wǒ hěn hǎo, xièxie", meaning: "I am very well, thank you", speech: "我很好，谢谢" },
      { pinyin: "nǐ jiào shénme míngzi", meaning: "what is your name?", speech: "你叫什么名字" },
      { pinyin: "wǒ jiào Mei", meaning: "my name is Mei", speech: "我叫Mei" },
      { pinyin: "hěn gāoxìng rènshi nǐ", meaning: "nice to meet you", speech: "很高兴认识你" },
      { pinyin: "zàijiàn", meaning: "goodbye", speech: "再见" },
    ],
  },
  {
    key: "directions",
    title: "Wènlù",
    titleEnglish: "Asking directions",
    titleChinese: "问路",
    theme: "asking-directions",
    description: "Ask where a place is and understand simple directions.",
    level: "beginner",
    objectives: ["Ask where something is", "Understand left, right and straight"],
    order: 3,
    isActive: true,
    vocabulary: [
      { pinyin: "qǐngwèn", meaning: "excuse me, may I ask", speech: "请问" },
      { pinyin: "yínháng zài nǎlǐ", meaning: "where is the bank?", speech: "银行在哪里" },
      { pinyin: "yīzhí zǒu", meaning: "go straight", speech: "一直走" },
      { pinyin: "wǎng zuǒ guǎi", meaning: "turn left", speech: "往左拐" },
      { pinyin: "wǎng yòu guǎi", meaning: "turn right", speech: "往右拐" },
      { pinyin: "hěn jìn", meaning: "very near", speech: "很近" },
      { pinyin: "hěn yuǎn", meaning: "very far", speech: "很远" },
    ],
  },
  {
    key: "taxi-travel",
    title: "Dǎchē hé lǚxíng",
    titleEnglish: "Taxi and travel",
    titleChinese: "打车和旅行",
    theme: "taxi-travel",
    description: "Tell a driver where you are going and ask the price.",
    level: "beginner",
    objectives: ["Say where you want to go", "Ask how much it costs"],
    order: 4,
    isActive: true,
    vocabulary: [
      { pinyin: "wǒ yào qù jīchǎng", meaning: "I want to go to the airport", speech: "我要去机场" },
      { pinyin: "wǒ yào qù fàndiàn", meaning: "I want to go to the hotel", speech: "我要去饭店" },
      { pinyin: "duōshao qián", meaning: "how much is it?", speech: "多少钱" },
      { pinyin: "qǐng tíng zài zhèlǐ", meaning: "please stop here", speech: "请停在这里" },
      { pinyin: "kuài yīdiǎn", meaning: "a bit faster", speech: "快一点" },
    ],
  },
  {
    key: "word-order",
    title: "Cíxù",
    titleEnglish: "Word order, time and place",
    titleChinese: "词序",
    theme: "word-order",
    description:
      "Chinese goes subject, verb, object, like English. With time and place the order is subject, time, place, verb. Time phrases go right after the subject, not at the end.",
    level: "beginner",
    objectives: ["Build simple sentences", "Put time and place in the right spot"],
    order: 5,
    isActive: true,
    vocabulary: [
      { pinyin: "wǒ chī le yí ge píngguǒ", meaning: "I ate an apple", speech: "我吃了一个苹果" },
      { pinyin: "wǒ xǐhuān zhōngwén", meaning: "I like Chinese", speech: "我喜欢中文" },
      { pinyin: "wǒ měitiān chī yí ge píngguǒ", meaning: "I eat an apple every day", speech: "我每天吃一个苹果" },
      { pinyin: "wǒ de jiějie míngtiān qù měiguó", meaning: "my older sister is going to the US tomorrow", speech: "我的姐姐明天去美国" },
      { pinyin: "wǒ měitiān zài jiā chī yí ge píngguǒ", meaning: "I eat an apple at home every day", speech: "我每天在家吃一个苹果" },
      { pinyin: "wǒ yī jiǔ jiǔ líng nián zài měiguó chūshēng", meaning: "I was born in the US in 1990", speech: "我一九九〇年在美国出生" },
    ],
  },
  {
    key: "negatives",
    title: "Fǒudìng",
    titleEnglish: "Saying no: bù and méiyǒu",
    titleChinese: "否定",
    theme: "negatives",
    description:
      "Bù is for the present and future, and when you do not want to do something. Bù changes to bú before a fourth-tone word. Méiyǒu is for things that did not happen or have not been done.",
    level: "beginner",
    objectives: ["Use bù and bú", "Use méiyǒu for the past"],
    order: 6,
    isActive: true,
    vocabulary: [
      { pinyin: "wǒ bù xǐhuān zhōngwén", meaning: "I don't like Chinese", speech: "我不喜欢中文" },
      { pinyin: "wǒ bú qù", meaning: "I'm not going", speech: "我不去" },
      { pinyin: "wǒ bù chī", meaning: "I don't eat / I don't want to eat", speech: "我不吃" },
      { pinyin: "wǒ méiyǒu chī píngguǒ", meaning: "I didn't eat the apple", speech: "我没有吃苹果" },
      { pinyin: "wǒ de jiějie zuótiān méiyǒu qù měiguó", meaning: "my older sister didn't go to the US yesterday", speech: "我的姐姐昨天没有去美国" },
    ],
  },
  {
    key: "questions",
    title: "Wèn wèntí",
    titleEnglish: "Asking questions",
    titleChinese: "问问题",
    theme: "questions",
    description:
      "Add ma to the end of a statement for a yes or no question. Shénme, nǎge and nǎlǐ come after the verb. Shénme shíhou, wèishénme and zěnme come before the verb. A time phrase goes before the question word.",
    level: "beginner",
    objectives: ["Ask yes or no questions with ma", "Use question words in the right place"],
    order: 7,
    isActive: true,
    vocabulary: [
      { pinyin: "nǐ xǐhuān zhōngwén ma", meaning: "do you like Chinese?", speech: "你喜欢中文吗" },
      { pinyin: "nǐ měitiān zài jiā chī yí ge píngguǒ ma", meaning: "do you eat an apple at home every day?", speech: "你每天在家吃一个苹果吗" },
      { pinyin: "nǐ xǐhuān shénme", meaning: "what do you like?", speech: "你喜欢什么" },
      { pinyin: "nǐ shénme shíhou qù", meaning: "when are you going?", speech: "你什么时候去" },
      { pinyin: "nǐ wèishénme qù měiguó", meaning: "why are you going to the US?", speech: "你为什么去美国" },
      { pinyin: "nǐ zěnme qù", meaning: "how are you going?", speech: "你怎么去" },
      { pinyin: "nǐ míngtiān zěnme qù", meaning: "how are you going tomorrow?", speech: "你明天怎么去" },
    ],
  },
  {
    // Stored now for the later characters feature. Not shown in the app yet.
    key: "radicals",
    title: "Bùshǒu",
    titleEnglish: "Radicals",
    titleChinese: "部首",
    theme: "radicals",
    description: "Common radicals (parts of characters).",
    level: "intermediate",
    objectives: [],
    order: 99,
    isActive: false,
    vocabulary: [
      { pinyin: "rén", meaning: "person", speech: "人" },
      { pinyin: "nǚ", meaning: "woman", speech: "女" },
      { pinyin: "xīn", meaning: "heart", speech: "心" },
      { pinyin: "shǒu", meaning: "hand", speech: "手" },
      { pinyin: "kǒu", meaning: "mouth", speech: "口" },
      { pinyin: "mù", meaning: "eye", speech: "目" },
      { pinyin: "yán", meaning: "speech", speech: "言" },
      { pinyin: "shuǐ", meaning: "water", speech: "水" },
      { pinyin: "huǒ", meaning: "fire", speech: "火" },
      { pinyin: "yī", meaning: "clothing", speech: "衣" },
    ],
  },
];

export const DRILLS: DrillSeed[] = [
  {
    lessonKey: "small-talk",
    title: "Zìwǒ jièshào",
    titleEnglish: "Introducing yourself",
    titleChinese: "自我介绍",
    transcript: "你好，我叫Mei。你叫什么名字？",
    transcriptPinyin: "Nǐ hǎo, wǒ jiào Mei. Nǐ jiào shénme míngzi?",
    level: "beginner",
    questions: [
      { text: "What is her name?", options: ["Evans", "Mei", "Lin"], correctAnswer: 1 },
      { text: "What does she ask you?", options: ["How you are", "Your name", "Where you live"], correctAnswer: 1 },
    ],
  },
  {
    lessonKey: "directions",
    title: "Wènlù",
    titleEnglish: "Asking the way",
    titleChinese: "问路",
    transcript: "请问，银行在哪里？一直走，然后往左拐。",
    transcriptPinyin: "Qǐngwèn, yínháng zài nǎlǐ? Yīzhí zǒu, ránhòu wǎng zuǒ guǎi.",
    level: "beginner",
    questions: [
      { text: "What place is being asked about?", options: ["A bank", "A hospital", "A school"], correctAnswer: 0 },
      { text: "Which way do you turn?", options: ["Right", "Go back", "Left"], correctAnswer: 2 },
    ],
  },
  {
    lessonKey: "taxi-travel",
    title: "Zài chūzūchē shàng",
    titleEnglish: "In a taxi",
    titleChinese: "在出租车上",
    transcript: "我要去机场。多少钱？",
    transcriptPinyin: "Wǒ yào qù jīchǎng. Duōshao qián?",
    level: "beginner",
    questions: [
      { text: "Where is the person going?", options: ["The hotel", "The station", "The airport"], correctAnswer: 2 },
      { text: "What do they ask?", options: ["The price", "The time", "The way"], correctAnswer: 0 },
    ],
  },
  {
    lessonKey: "tones",
    title: "Sì gè shēngdiào",
    titleEnglish: "The four tones",
    titleChinese: "四个声调",
    transcript: "妈，麻，马，骂。",
    transcriptPinyin: "Mā, má, mǎ, mà.",
    level: "beginner",
    questions: [
      { text: "Which tone is flat and high?", options: ["Second tone (má)", "First tone (mā)", "Fourth tone (mà)"], correctAnswer: 1 },
      { text: "Which tone falls sharply?", options: ["First tone (mā)", "Third tone (mǎ)", "Fourth tone (mà)"], correctAnswer: 2 },
    ],
  },
];
