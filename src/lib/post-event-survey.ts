export type SurveyFollowUp = "none" | "planning" | "messaged" | "met" | "ongoing";

export type PostEventSurveyInput = {
  eventId: string;
  overallRating: number;
  connectionRating: number;
  continuedConnectionRating: number;
  followUp: SurveyFollowUp;
  outcome: string;
};

export type PostEventSurveyResponse = PostEventSurveyInput & {
  id: string;
  eventTitle: string;
  memberUsername: string;
  memberName: string;
  createdAt: string;
};

export type PostEventSurveyAdminPayload = {
  responses: PostEventSurveyResponse[];
  summary: {
    total: number;
    overallAverage: number;
    connectionAverage: number;
    continuedConnectionAverage: number;
    meaningfulFollowUpRate: number;
  };
};

const API_URL = "/api/post-event-survey";

export async function submitPostEventSurvey(input: PostEventSurveyInput) {
  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error((await response.text()) || "Anket gönderilemedi");
  return (await response.json()) as PostEventSurveyResponse;
}

export async function getPostEventSurveyAdmin(password: string) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "list", password }),
  });
  if (!response.ok) throw new Error((await response.text()) || "Anket sonuçları alınamadı");
  return (await response.json()) as PostEventSurveyAdminPayload;
}
