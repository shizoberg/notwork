export type WordcloudQuestion = {
  id: string;
  order: number;
  title: string;
  helper: string;
  isActive: boolean;
  maxAnswersPerSession: number;
  updatedAt: string;
};

export type WordcloudEventConfig = {
  eventId: string;
  title: string;
  shortTitle: string;
  isOpen: boolean;
  allowEdit: boolean;
  updatedAt: string;
};

export type WordcloudAnswer = {
  id: string;
  eventId: string;
  questionId: string;
  sessionId: string;
  rawText: string;
  normalizedText: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WordcloudWord = {
  text: string;
  count: number;
  variants: string[];
};

export type WordcloudResults = {
  event: WordcloudEventConfig;
  questions: WordcloudQuestion[];
  activeQuestionId: string;
  results: Record<string, WordcloudWord[]>;
  totalVisibleAnswers: number;
  generatedAt: string;
};

export const wordcloudEventId = "21-agustos-2026";

export function normalizeWordcloudText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[“”"'.!?;:()[\]{}<>/\\|=+*_~`^%$#@]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function cleanWordcloudAnswer(value: unknown) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 60)
    : "";
}

export function wordcloudSize(count: number, maxCount: number) {
  if (maxCount <= 1) return 1;
  return 0.85 + (count / maxCount) * 2.4;
}
