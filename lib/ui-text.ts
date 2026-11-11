// Every visible label in the app: pinyin with tone marks (shown large) + English meaning (shown small).
// Never put Chinese characters in this file. Characters may exist only as hidden audio data.

export type Label = { py: string; en: string };
const L = (py: string, en: string): Label => ({ py, en });

export const T = {
  // Tabs
  home: L("Zhǔyè", "Home"),
  learn: L("Xuéxí", "Learn"),
  mei: L("Mei", "Talk"),
  community: L("Shèqū", "Community"),
  me: L("Wǒ", "Me"),

  // Actions
  add: L("Tiānjiā", "Add"),
  edit: L("Biānjí", "Edit"),
  delete: L("Shānchú", "Delete"),
  save: L("Bǎocún", "Save"),
  cancel: L("Qǔxiāo", "Cancel"),
  play: L("Bōfàng", "Play"),
  slow: L("Màn", "Slow"),
  normal: L("Zhèngcháng", "Normal"),
  speed: L("Sùdù", "Speed"),
  next: L("Xià yī gè", "Next"),
  done: L("Wánchéng", "Done"),
  send: L("Fāsòng", "Send"),
  post: L("Fābiǎo", "Post"),
  continue: L("Jìxù", "Continue"),
  skip: L("Xiān tiàoguò", "Skip for now"),
  tryAgain: L("Zài shì yī cì", "Try again"),
  hint: L("Tíshì", "Hint"),

  // Account
  signIn: L("Dēnglù", "Sign in"),
  signUp: L("Zhùcè", "Sign up"),
  signOut: L("Tuìchū", "Sign out"),
  email: L("Yóuxiāng", "Email"),
  password: L("Mìmǎ", "Password (8+ characters)"),
  passwordShort: L("Mìmǎ", "Password"),
  name: L("Míngzi", "Name"),
  welcomeBack: L("Huānyíng huílái", "Welcome back"),
  createAccount: L("Chuàngjiàn zhànghào", "Create your account"),
  creating: L("Zhèngzài chuàngjiàn…", "Creating account…"),
  signingIn: L("Zhèngzài dēnglù…", "Signing in…"),
  newHere: L("Dì yī cì lái?", "New here?"),
  haveAccount: L("Yǐjīng yǒu zhànghào?", "Already have an account?"),
  iHaveAccount: L("Wǒ yǒu zhànghào le", "I already have an account"),
  getStarted: L("Kāishǐ ba", "Get started"),
  acceptTerms: L("Wǒ yuēdéng liǎojiě bìng jiēshòu Pinyin Talk de fúwù tiákuǎn", "I agree to the terms and rules"),
  privacyPolicy: L("Yǐn sī zhèngcè", "Privacy policy"),
  terms: L("Fúwù tiákuǎn", "Terms of use"),
  communityRules: L("Shèqū guīzé", "Community rules"),
  cookieNotice: L("Qiǎokèbiànzhǐ", "Cookie notice"),
  legalDraft: L("Gǎi yìng yóu lǜshī shāngchá", "Draft for lawyer review"),
  tagline: L("Bǎ nǐ huì de Zhōngwén jì láo", "Keep the Mandarin you know"),
  tagline2: L("Tīng yī tīng, shuō yī shuō, hé Mei liáotiān", "Hear it, say it, chat with Mei"),

  // Home
  startReview: L("Kāishǐ fùxí", "Start review"),
  review: L("Fùxí", "Review"),
  myPhrases: L("Wǒ de duǎnyǔ", "My phrases"),
  emptyPhrases: L("Nǐ hái méiyǒu tiānjiā duǎnyǔ", "You haven't added any phrases yet"),
  tapAddFirst: L("Diǎn zhèlǐ tiānjiā dì yī gè", "Tap here to add your first one"),
  streak: L("Liánxù", "Streak"),

  // Phrases
  phraseInPinyin: L("Pīnyīn duǎnyǔ", "Phrase in pinyin"),
  meaning: L("Yìsi", "Meaning"),
  search: L("Sōusuǒ", "Search"),
  addPhrase: L("Tiānjiā duǎnyǔ", "Add a phrase"),
  quickAdd: L("Kuàisù tiānjiā", "Quick add"),
  noMatch: L("Méiyǒu zhǎodào", "No phrases match your search"),
  onboardingTitle: L("Nǐ yǐjīng huì shuō nǎxiē Zhōngwén duǎnyǔ?", "Which Chinese phrases do you already know?"),
  onboardingHelp: L("Yòng pīnyīn tiānjiā. Pinyin Talk bāng nǐ jìzhù tāmen.", "Add them in pinyin. Pinyin Talk helps you remember them."),

  // Review
  listenPick: L("Tīng yī tīng, xuǎn yìsi", "Listen, then pick the meaning"),
  correct: L("Zhèngquè!", "Correct!"),
  notQuite: L("Bú tài duì", "Not quite"),
  sessionDone: L("Liànxí wánchéng", "Session done"),
  practiseAgain: L("Zàicì liànxí", "Practise again"),
  nothingDue: L("Xiànzài méiyǒu yào fùxí de", "Nothing due right now"),
  comeBack: L("Děng yīhuìr zài lái. Nǐ de duǎnyǔ huì àn jìhuà huílái.", "Come back later. Your phrases return on schedule."),
  noPhrasesYet: L("Hái méiyǒu duǎnyǔ", "No phrases yet"),
  addPhrasesFirst: L("Xiān tiānjiā nǐ huì de duǎnyǔ", "Add the phrases you know first"),
  chatWithMei: L("Gēn Mei liáotiān", "Chat with Mei"),
  noVoice: L("Zhège shǒujī méiyǒu Zhōngwén yǔyīn", "No Mandarin voice on this device. Check your phone's text-to-speech settings."),

  // Mei
  messageMei: L("Gěi Mei fā xiāoxi", "Message Mei"),
  thinking: L("Mei zhèngzài xiǎng", "Mei is thinking"),
  speaking: L("Mei zhèngzài shuōhuà", "Mei is speaking"),
  newPhrase: L("Xīn duǎnyǔ", "New phrase"),
  addToPhrases: L("Tiānjiā dào wǒ de duǎnyǔ", "Add to my phrases"),
  added: L("Yǐ tiānjiā", "Added"),
  helpEnglish: L("Yīngwén bāngzhù", "Help in English"),
  chatIntro: L("Gēn Mei dǎ gè zhāohu ba. Kěyǐ yòng pīnyīn huò Yīngwén.", "Say hi to Mei. Write in pinyin or English."),
  howSayGoodbye: L("Zěnme shuō zàijiàn?", "How do I say goodbye?"),

  // Voice
  tapToTalk: L("Diǎn yīxià shuōhuà", "Tap to talk"),
  youSaid: L("Nǐ shuō", "You said"),
  meiSaid: L("Mei shuō", "Mei said"),
  replay: L("Zài tīng yī biàn", "Replay"),
  replayEnglish: L("Zài tīng Yīngwén", "Replay English"),
  talkToMei: L("Gēn Mei shuōhuà", "Talk to Mei"),
  micBlocked: L(
    "Màikèfēng bèi zǔzhǐ le",
    "Android (Chrome): tap the lock icon by the address, then Permissions, then allow Microphone. iPhone (Safari): Settings, Safari, Microphone, choose Ask or Allow, then reload."
  ),
  micFailed: L("Zhège shǒujī wúfǎ yòng màikèfēng", "Could not use the microphone on this device."),
  voiceFallback: L("Mei de yǔyīn bù kě yòng, xiànzài yòng shǒujī zìdài yǔyīn", "Mei's voice was not available, so your phone's built-in voice is used."),
  hearMei: L("Tīng Mei shuō", "Hear Mei"),
  testSayHello: L("Gēn Mei shuō nǐ hǎo", "Say nǐ hǎo to Mei"),
  testTitle: L("Cèshì Mei", "Test Mei"),
  testVoiceHelp: L("Diǎn yīxià, shuō nǐ hǎo, nǐ jiào shénme míngzi, huò nǐ hǎo ma, zài diǎn yīxià tíngzhǐ.", "Tap the mic, say nǐ hǎo, nǐ jiào shénme míngzi or nǐ hǎo ma, then tap again to stop."),

  // Community
  askQuestion: L("Wèn gè wèntí", "Ask a question"),
  noQuestions: L("Hái méiyǒu wèntí", "No questions yet"),
  beFirst: L("Lái wèn dì yī gè ba", "Be the first to ask"),
  teacherReply: L("Lǎoshī huídá", "Teacher reply"),
  waitingTeacher: L("Děngdài lǎoshī huídá", "Waiting for a teacher"),
  level: L("Shuǐpíng", "Level"),
  beginner: L("Chūjí", "Beginner"),
  tones: L("Shēngdiào", "Tones"),
  travel: L("Lǚxíng", "Travel"),

  // Learn hub / Me
  reviewHelp: L("Tīng duǎnyǔ, xuǎn yìsi", "Hear a phrase and pick its meaning"),
  phrasesHelp: L("Kàn, tīng, xiūgǎi nǐ de duǎnyǔ", "See, hear and edit your phrases"),
  settings: L("Shèzhì", "Settings"),
  englishAfter: L("Zhōngwén hòu shuō Yīngwén", "English after Chinese"),
  englishAfterHelp: L("Mei shuō wán Zhōngwén hòu, yòng Yīngwén jiěshì", "After speaking Mandarin, Mei explains in English"),
  on: L("Kāi", "On"),
  off: L("Guān", "Off"),
  account: L("Zhànghào", "Account"),

  // Errors and empty pages
  oops: L("Chū cuò le", "Something went wrong"),
  notFound: L("Zhǎo bù dào zhège yèmiàn", "Page not found"),
  goHome: L("Huí zhǔyè", "Go home"),

  // History and saved conversations
  history: L("Lìshǐ", "History"),
  newConversation: L("Xīn duìhuà", "New conversation"),
  continueConversation: L("Jìxù zhège duìhuà", "Continue this conversation"),
  deleteConversation: L("Shānchú duìhuà", "Delete conversation"),
  deleteMessage: L("Shānchú zhè tiáo", "Delete this message"),
  noConversations: L("Hái méiyǒu duìhuà", "No conversations yet"),
  startTalking: L("Gēn Mei shuō jǐ jù ba", "Say a few words to Mei"),
  you: L("Nǐ", "You"),
  chineseClip: L("Zhōngwén", "Chinese"),
  englishClip: L("Yīngwén", "English"),
  previewTitle: L("Xiān tīng yī tīng", "Listen before sending"),
  reRecord: L("Chóngxīn lùyīn", "Record again"),
  talkMode: L("Shuōhuà", "Talk"),
  typeMode: L("Dǎzì", "Type"),
  noRecording: L("Méiyǒu lùyīn", "No recording"),
  saveFailed: L("Zhè yī huí méi bǎocún chénggōng", "This turn could not be saved"),
  savedPlayback: L("Zhè shì bǎocún de lùyīn, bōfàng bú yòng huāqián", "Saved audio, replaying is free"),

  // Lessons and drills
  lessons: L("Kèchéng", "Lessons"),
  lessonsHelp: L("Àn zhǔtí xuéxí duǎnyǔ", "Learn phrases by theme"),
  drills: L("Tīnglì liànxí", "Listening drills"),
  drillsHelp: L("Tīng yī duàn huà, huídá wèntí", "Listen, then answer questions"),
  addAllPhrases: L("Dōu tiānjiā dào wǒ de duǎnyǔ", "Add all to my phrases"),
  vocabulary: L("Cíhuì", "Vocabulary"),
  objectives: L("Mùbiāo", "Goals"),
  relatedDrills: L("Xiāngguān tīnglì liànxí", "Related listening drills"),
  startListening: L("Kāishǐ tīng", "Start listening"),
  question: L("Wèntí", "Question"),
  submitAnswers: L("Tíjiāo dá'àn", "Submit answers"),
  transcript: L("Yuánwén", "Transcript"),
  noLessons: L("Hái méiyǒu kèchéng", "No lessons yet"),

  // Community: learners and messages
  people: L("Xuéxí huǒbàn", "Learners"),
  messages: L("Sīxìn", "Messages"),
  follow: L("Guānzhù", "Follow"),
  following: L("Yǐ guānzhù", "Following"),
  message: L("Fā xiāoxi", "Message"),
  noPeople: L("Hái méiyǒu qítā xuéxízhě", "No other learners yet"),
  noMessages: L("Hái méiyǒu sīxìn", "No messages yet"),
  followFirst: L("Xiān guānzhù tā, zài fā xiāoxi", "Follow this learner first to send a message"),
  newBadge: L("Xīn", "New"),
  back: L("Fǎnhuí", "Back"),
} as const;

// Counts and names are built here so the pinyin and English stay together.
export const hello = (name: string): Label => L(`Nǐ hǎo, ${name}!`, `Hello, ${name}!`);
export const CONFIRM_DELETE_CONVERSATION =
  "Shānchú zhège duìhuà hé suǒyǒu lùyīn? (Delete this conversation and all its recordings?)";
export const CONFIRM_DELETE_MESSAGE = "Shānchú zhè tiáo xiāoxi hé lùyīn? (Delete this message and its recordings?)";
export const turnCount = (n: number): Label => L(`${n} tiáo xiāoxi`, `${n} ${n === 1 ? "message" : "messages"}`);
export const drillScore = (n: number, m: number): Label => L(`${n} / ${m} zhèngquè`, `${n} of ${m} correct`);
export const phrasesAdded = (n: number): Label => L(`Yǐ tiānjiā ${n} gè duǎnyǔ`, `${n} phrases added`);
export const followerCounts = (followers: number, following: number): Label =>
  L(`${followers} gè fěnsī · guānzhù ${following} gè rén`, `${followers} followers · following ${following}`);
export const dueToday = (n: number): Label => L(`Jīntiān yǒu ${n} gè duǎnyǔ yào fùxí`, `${n} ${n === 1 ? "phrase" : "phrases"} due today`);
export const messagesLeft = (n: number): Label => L(`Jīntiān hái yǒu ${n} tiáo xiāoxi`, `${n} messages left today`);
export const recording = (s: number): Label => L(`Zhèngzài lùyīn ${s} miǎo`, "Tap again to stop");
export const sessionScore = (right: number, best: number): Label =>
  L(`${right} gè zhèngquè · zuì cháng liánxù ${best}`, `${right} right · best streak ${best}`);
export const progress = (i: number, n: number, streak: number): Label =>
  L(`${i} / ${n} · liánxù ${streak}`, `${i} of ${n} · streak ${streak}`);

// Known error messages (English from the server) get a pinyin headline. Anything else uses "Chū cuò le".
const ERRORS: [RegExp, string][] = [
  [/invalid email or password/i, "Yóuxiāng huò mìmǎ bú duì"],
  [/already exists/i, "Zhège yóuxiāng yǐjīng zhùcè le"],
  [/at least 8/i, "Mìmǎ zhìshǎo yào 8 wèi"],
  [/at least 2/i, "Míngzi tài duǎn le"],
  [/invalid email address/i, "Yóuxiāng géshì bú duì"],
  [/already have this phrase/i, "Nǐ yǐjīng yǒu zhège duǎnyǔ le"],
  [/type the phrase in pinyin/i, "Qǐng shūrù pīnyīn duǎnyǔ"],
  [/not chinese characters/i, "Qǐng yòng pīnyīn, bú yào yòng hànzì"],
  [/add the meaning/i, "Qǐng tiānjiā yìsi"],
  [/used all of today/i, "Jīntiān de xiāoxi yòng wán le, míngtiān zài lái"],
  [/quota/i, "Édù yòng wán le, qǐng shāohòu zài shì"],
  [/network/i, "Wǎngluò yǒu wèntí, qǐng zài shì"],
  [/no clear speech|empty or could not|didn't catch/i, "Wǒ méi tīng qīngchǔ, qǐng zài shuō yī cì"],
  [/microphone/i, "Màikèfēng yǒu wèntí"],
  [/key/i, "Mìyào yǒu wèntí"],
  [/sign in/i, "Qǐng xiān dēnglù"],
  [/something went wrong/i, "Chū cuò le, qǐng zài shì yī cì"],
  [/invalid/i, "Shūrù bú duì"],
];

export function errorLabel(message: string): Label {
  const hit = ERRORS.find(([re]) => re.test(message));
  return L(hit ? hit[1] : T.oops.py, message);
}
