export type TablePerson = { id: string; name: string; code: string; problem: string };
export type ProblemTable = {
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
export function memberTable(state: TableState, personId: string, expectedId: string) {
  if (state.members[personId] !== expectedId || !state.tables[expectedId])
    throw new Error("Bu masa oturumun değişti. Ekranı yenile.");
  return state.tables[expectedId];
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
