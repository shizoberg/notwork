import type { Config, Context } from "@netlify/functions";
import { ensureSeeded, getResults, getWordcloudStore } from "./_wordcloud-store.mjs";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async (_request: Request, _context: Context) => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const store = getWordcloudStore();
      await ensureSeeded(store);

      for (let index = 0; index < 30; index += 1) {
        const results = await getResults(store);
        controller.enqueue(encoder.encode(`event: results\ndata: ${JSON.stringify(results)}\n\n`));
        await sleep(2000);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "cache-control": "no-store",
      "content-type": "text/event-stream; charset=utf-8",
      connection: "keep-alive",
    },
  });
};

export const config: Config = { path: "/api/events/21-agustos/wordcloud/stream" };
