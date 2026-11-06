import { LIMITS } from "@/lib/config";

const DAY_MS = 24 * 60 * 60 * 1000;

// Right: double the interval (1, 2, 4, 8, 16, up to 30). Wrong: back to 1 day.
export function nextSchedule(correct: boolean, currentInterval: number, now = new Date()) {
  const intervalDays = correct
    ? Math.min(Math.max(currentInterval, 1) * 2, LIMITS.maxIntervalDays)
    : 1;
  return { intervalDays, nextReviewAt: new Date(now.getTime() + intervalDays * DAY_MS) };
}
