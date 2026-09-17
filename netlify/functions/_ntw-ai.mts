import { getStore } from "@netlify/blobs";
import { atomicState } from "./_atomic-state.mjs";

type MatchProfile = {
  participant: { id: string };
  offers: string[];
  offersDetail: string;
  needs: string;
  needTag: string;
};

type FivePerson = {
  id: string;
  offers?: string[];
  offersDetail?: string;
  needs?: string;
  problem?: string;
};

const model = "gpt-5.6-luna";
const maxCallsPerEvent = 400;
const maxRequestBytes = 30_000;

function clean(value: unknown, max = 400) {
  return typeof value === "string"
    ? value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function safeScope(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(-120) || "event";
}

async function reserveCall(scope: string) {
  if (!process.env.OPENAI_API_KEY || process.env.NTW_AI_ENABLED === "false") return false;
  try {
    return await atomicState(
      getStore({ name: "ntw-ai", consistency: "strong" }),
      `usage/${safeScope(scope)}.json`,
      () => ({ calls: 0, updatedAt: "" }),
      (state) => {
        if (state.calls >= maxCallsPerEvent) return false;
        state.calls += 1;
        state.updatedAt = new Date().toISOString();
        return true;
      },
    );
  } catch (error) {
    console.error("ntw ai bütçe sayacı güncellenemedi", error);
    return false;
  }
}

function outputText(payload: unknown) {
  const response = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  if (response.output_text) return response.output_text;
  return (response.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text || "")
    .join("");
}

async function structuredResponse<T>(
  scope: string,
  schemaName: string,
  schema: Record<string, unknown>,
  instructions: string,
  input: unknown,
): Promise<T | null> {
  const requestBody = JSON.stringify({
    model,
    store: false,
    reasoning: { effort: "none" },
    max_output_tokens: 180,
    instructions,
    input: JSON.stringify(input),
    text: {
      verbosity: "low",
      format: { type: "json_schema", name: schemaName, strict: true, schema },
    },
  });
  if (Buffer.byteLength(requestBody, "utf8") > maxRequestBytes || !(await reserveCall(scope)))
    return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1800);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
      signal: controller.signal,
      body: requestBody,
    });
    if (!response.ok) {
      console.error("ntw ai yanıt hatası", response.status, (await response.text()).slice(0, 300));
      return null;
    }
    return JSON.parse(outputText(await response)) as T;
  } catch (error) {
    console.error("ntw ai çağrısı tamamlanamadı", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function rerankMatchCandidates(
  scope: string,
  current: MatchProfile,
  candidates: MatchProfile[],
  desiredCount: number,
) {
  const shortlist = candidates.slice(0, 8);
  const result = await structuredResponse<{ participantIds: string[] }>(
    scope,
    "ntw_match_ranking",
    {
      type: "object",
      additionalProperties: false,
      properties: {
        participantIds: {
          type: "array",
          items: { type: "string" },
          minItems: desiredCount,
          maxItems: desiredCount,
        },
      },
      required: ["participantIds"],
    },
    `Sen notwork etkinliğinin eşleştirme destek sistemisin. Ana kişinin ihtiyacını tamamlayan ve birbirine de katkı sağlayabilecek ${desiredCount} kişiyi seç. Yalnızca verilen participantId değerlerini kullan. Hassas özellik çıkarımı yapma.`,
    {
      current: {
        needs: clean(current.needs, 120),
        needTag: clean(current.needTag, 60),
        offers: current.offers.map((row) => clean(row, 60)).slice(0, 5),
        offersDetail: clean(current.offersDetail, 120),
      },
      candidates: shortlist.map((candidate) => ({
        participantId: candidate.participant.id,
        needs: clean(candidate.needs, 120),
        needTag: clean(candidate.needTag, 60),
        offers: candidate.offers.map((row) => clean(row, 60)).slice(0, 5),
        offersDetail: clean(candidate.offersDetail, 120),
      })),
    },
  );
  const validIds = new Set(shortlist.map((row) => row.participant.id));
  const selected = [...new Set(result?.participantIds || [])].filter((id) => validIds.has(id));
  return selected.length === desiredCount ? selected : null;
}

export async function generateMatchAnalysis(scope: string, members: MatchProfile[]) {
  const result = await structuredResponse<{ analysis: string }>(
    scope,
    "ntw_match_analysis",
    {
      type: "object",
      additionalProperties: false,
      properties: { analysis: { type: "string", maxLength: 240 } },
      required: ["analysis"],
    },
    "Sen notwork match analizisin. Bu grubun neden eşleştiğini ve bu buluşmadan ne doğabileceğini doğal Türkçeyle tek cümlede anlat. Kesin sonuç vaat etme. İsim kullanma. En fazla 220 karakter yaz.",
    members.map((member) => ({
      needs: clean(member.needs, 120),
      needTag: clean(member.needTag, 60),
      offers: member.offers.map((row) => clean(row, 60)).slice(0, 5),
      offersDetail: clean(member.offersDetail, 120),
    })),
  );
  return clean(result?.analysis, 240) || null;
}

export async function generateFiveAnalysis(
  scope: string,
  problem: { title: string; description?: string; tried?: string; desiredOutcome?: string },
  people: FivePerson[],
) {
  const result = await structuredResponse<{ analysis: string }>(
    scope,
    "ntw_five_analysis",
    {
      type: "object",
      additionalProperties: false,
      properties: { analysis: { type: "string", maxLength: 260 } },
      required: ["analysis"],
    },
    "Sen ntw five problem masası analizisin. Sorunun özünü, insanların ayırt edici katkılarını ve birlikte üretebilecekleri olası çözüm yönünü tek doğal Türkçe cümlede açıkla. Kesin sonuç vaat etme. İsim kullanma. En fazla 240 karakter yaz.",
    {
      problem: {
        title: clean(problem.title, 160),
        description: clean(problem.description, 200),
        tried: clean(problem.tried, 140),
        desiredOutcome: clean(problem.desiredOutcome, 140),
      },
      people: people.slice(0, 4).map((person) => ({
        offers: (person.offers || []).map((row) => clean(row, 60)).slice(0, 5),
        offersDetail: clean(person.offersDetail, 120),
        needs: clean(person.needs || person.problem, 120),
      })),
    },
  );
  return clean(result?.analysis, 260) || null;
}
