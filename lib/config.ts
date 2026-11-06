// One place for per-user limits. Free vs paid plans can plug in here later.
export const LIMITS = {
  meiDailyMessages: 30,
  meiPhrasesInPrompt: 30,
  maxIntervalDays: 30,
  reviewBatchSize: 20,
} as const;
