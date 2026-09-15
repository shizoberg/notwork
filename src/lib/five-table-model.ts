export type TablePerson = { id: string; name: string; code: string; problem: string };
export type TableOutcome = {
  solved: boolean;
  solution: string;
  rating: number;
  comment: string;
  consentAt: number;
  publishedAt?: number;
  at: number;
};
export type ProblemTable = {
  messages?: { id: string; personId: string; name: string; text: string; at: number }[];
  outcomes?: Record<string, TableOutcome>;
  id: string;
  code: string;
  problemId: string;
  title: string;
  people: TablePerson[];
  phase: "waiting" | "ready" | "active" | "finished";
  round: number;
  topics: string[];
  endsAt: number;
  photoOwner: string;
  photoSaved: boolean;
};
export type TableState = {
  sequence: number;
  tables: Record<string, ProblemTable>;
  members: Record<string, string>;
};
export const emptyTables = (): TableState => ({ sequence: 0, tables: {}, members: {} });

export function hasCompleteTableOutcome(outcome?: TableOutcome) {
  return Boolean(
    outcome &&
      Number.isInteger(outcome.rating) &&
      outcome.rating >= 1 &&
      outcome.rating <= 5 &&
      outcome.comment?.trim().length >= 3 &&
      outcome.consentAt &&
      outcome.publishedAt,
  );
}
export function joinTable(
  state: TableState,
  person: TablePerson,
  problem: { id: string; title: string },
) {
  const existing = state.members[person.id];
  if (existing) {
    if (state.tables[existing]?.problemId === problem.id) return state.tables[existing];
    throw new Error("Önce bulunduğun masadan ayrıl.");
  }
  let table = Object.values(state.tables).find(
    (t) => t.problemId === problem.id && t.phase === "waiting" && t.people.length < 4,
  );
  if (!table) {
    const n = ++state.sequence;
    table = {
      id: `table-${n}`,
      code: `F${String(n).padStart(3, "0")}`,
      problemId: problem.id,
      title: problem.title,
      people: [],
      phase: "waiting",
      round: 0,
      topics: [],
      endsAt: 0,
      photoOwner: "",
      photoSaved: false,
    };
    state.tables[table.id] = table;
  }
  table.people.push(person);
  state.members[person.id] = table.id;
  if (table.people.length === 4) {
    table.phase = "ready";
    table.topics = [table.title, ...table.people.slice(1).map((p) => p.problem || table.title)];
    table.photoOwner = table.people[(state.sequence - 1) % 4].id;
  }
  return table;
}

export function publishTableOutcome(
  state: TableState,
  personId: string,
  tableId: string,
  now: number,
) {
  const table = memberTable(state, personId, tableId);
  const outcome = table.outcomes?.[personId];
  if (!outcome) throw new Error("Önce masa değerlendirmesini tamamla.");
  outcome.publishedAt = now;
  return table;
}
export function memberTable(state: TableState, personId: string, expectedId: string) {
  if (state.members[personId] !== expectedId || !state.tables[expectedId])
    throw new Error("Bu masa oturumun değişti. Ekranı yenile.");
  return state.tables[expectedId];
}
export function tableChat(state: TableState, personId: string, tableId: string, id: string, text: string, now: number) {
  const table = memberTable(state, personId, tableId);
  const person = table.people.find((p) => p.id === personId);
  if (!person) throw new Error("Bu grubun üyesi değilsin.");
  const body = text.trim();
  if (!/^[a-zA-Z0-9-]{8,80}$/.test(id) || !body || body.length > 500)
    throw new Error("Mesaj 1–500 karakter olmalı.");
  const messages = table.messages || [];
  if (messages.some((m) => m.id === id && m.personId === personId)) return table;
  if (messages.some((m) => m.personId === personId && now - m.at < 1500))
    throw new Error("Yeni mesaj için bir an bekle.");
  table.messages = [...messages, { id, personId, name: person.name, text: body, at: now }].slice(-100);
  return table;
}
export function tableOutcome(
  state: TableState,
  personId: string,
  tableId: string,
  solved: boolean,
  solution: string,
  rating: number,
  comment: string,
  reviewConsent: boolean,
  now: number,
) {
  const table = memberTable(state, personId, tableId);
  const answer = solution.trim().replace(/\s+/g, " ");
  const review = comment.trim().replace(/\s+/g, " ");
  if (table.phase !== "finished") throw new Error("Önce görüşme turlarını tamamla.");
  if (answer.length < 3 || answer.length > 300) throw new Error("Çözümü 3–300 karakterle yaz.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    throw new Error("Puan 1–5 arasında olmalı.");
  if (review.length < 3 || review.length > 240)
    throw new Error("Masa yorumunu 3–240 karakterle yaz.");
  if (!reviewConsent) throw new Error("Yorum ve fotoğraf yayınlama izni gerekli.");
  table.outcomes ||= {};
  table.outcomes[personId] = {
    solved,
    solution: answer,
    rating,
    comment: review,
    consentAt: now,
    at: now,
  };
  return table;
}
export function tableAction(
  state: TableState,
  personId: string,
  id: string,
  action: "start" | "next" | "leave" | "photo",
  now: number,
  expectedRound: number,
) {
  const table = memberTable(state, personId, id);
  if (action === "leave") {
    if (table.phase === "finished" && !hasCompleteTableOutcome(table.outcomes?.[personId]))
      throw new Error("Ayrılmadan önce çözüm sonucunu paylaş.");
    table.people = table.people.filter((p) => p.id !== personId);
    delete state.members[personId];
    if (!table.people.length) {
      delete state.tables[id];
      return null;
    }
    if (table.phase === "ready") {
      table.phase = "waiting";
      table.topics = [];
    }
    if (table.photoOwner === personId) table.photoOwner = table.people[0].id;
    return table;
  }
  if (table.round !== expectedRound) throw new Error("Tur değişti. Ekranı yenile.");
  if (action === "photo") {
    if (table.phase !== "active" || now < table.endsAt || table.photoOwner !== personId)
      throw new Error("Fotoğraf görevi henüz sende değil.");
    table.photoSaved = true;
    return table;
  }
  if (action === "start") {
    if (table.phase === "active") return table;
    if (table.phase !== "ready" || table.people.length !== 4)
      throw new Error("Başlamak için masada dört kişi olmalı.");
    table.phase = "active";
    table.endsAt = now + 300000;
    return table;
  }
  if (table.phase !== "active" || now < table.endsAt)
    throw new Error("Bu turun beş dakikası henüz bitmedi.");
  if (!table.photoSaved)
    throw new Error("Önce fotoğraf görevi tamamlanmalı. İstersen masadan ayrılabilirsin.");
  if (table.round >= table.topics.length - 1) {
    table.phase = "finished";
    return table;
  }
  table.round++;
  table.endsAt = now + 300000;
  return table;
}
