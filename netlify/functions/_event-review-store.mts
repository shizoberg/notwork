import { getStore } from "@netlify/blobs";

const liveStoreName = "event-reviews";
const demoStoreName = "event-reviews-demo";

function configuredDatabaseMode() {
  const value =
    process.env.EVENT_REVIEW_DATABASE?.trim().toLocaleLowerCase("tr-TR") ||
    process.env.NETLIFY_EVENT_REVIEW_DATABASE?.trim().toLocaleLowerCase("tr-TR");
  return value === "demo" ? "demo" : "live";
}

const directStoreName =
  process.env.EVENT_REVIEW_STORE?.trim() || process.env.NETLIFY_EVENT_REVIEW_STORE?.trim();
const requestedMode = configuredDatabaseMode();
const storeName =
  directStoreName || (requestedMode === "demo" ? demoStoreName : liveStoreName);
const mode = directStoreName
  ? storeName === liveStoreName
    ? "live"
    : "demo"
  : requestedMode;

export function getEventReviewStore() {
  return getStore({ name: storeName, consistency: "strong" });
}

export function getEventReviewDatabaseInfo() {
  return {
    storeName,
    activeDatabaseCode: storeName,
    demoDatabaseCode: demoStoreName,
    liveDatabaseCode: liveStoreName,
    mode,
  };
}
