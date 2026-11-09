import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

// Run the real function handlers and storage logic against only in-memory data.
export async function functionSandbox(options = {}) {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "notwork-event-regression-"));
  await fs.writeFile(path.join(temp, "package.json"), '{"type":"module"}');
  const mock = path.join(temp, "memory-blobs.mjs");
  await fs.copyFile(new URL("./memory-blobs.mjs", import.meta.url), mock);
  if (options.persistDir) {
    await fs.mkdir(options.persistDir, { recursive: true });
    let memory = await fs.readFile(mock, "utf8");
    memory =
      `import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";\nconst persistDir = ${JSON.stringify(options.persistDir)};\n` +
      memory;
    memory = memory.replace(
      "  const rows = new Map();\n  let revision = 0;",
      `  const file = persistDir + "/" + encodeURIComponent(name) + ".json";
  const saved = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { rows: [], revision: 0 };
  const rows = new Map(saved.rows);
  let revision = saved.revision;
  const persist = () => { writeFileSync(file + ".tmp", JSON.stringify({ rows: [...rows], revision })); renameSync(file + ".tmp", file); };`,
    );
    memory = memory.replace(
      "rows.set(key, { data: structuredClone(data), etag });",
      "rows.set(key, { data: structuredClone(data), etag }); persist();",
    );
    memory = memory.replace("rows.delete(key);", "rows.delete(key); persist();");
    await fs.writeFile(mock, memory);
  }

  for (const directory of ["netlify/functions", "src/lib"]) {
    await fs.mkdir(path.join(temp, directory), { recursive: true });
    for (const name of await fs.readdir(path.join(root, directory))) {
      if (!/\.(mts|ts)$/.test(name)) continue;
      let source = (await fs.readFile(path.join(root, directory, name), "utf8"))
        .replaceAll('"@netlify/blobs"', JSON.stringify(pathToFileURL(mock).href))
        .replace(/(from\s+["'][^"']+)\.ts(["'])/g, "$1.js$2");
      if (options.adminPassword)
        source = source.replaceAll(
          "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee",
          createHash("sha256").update(options.adminPassword).digest("hex"),
        );
      const compiled = ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      });
      await fs.writeFile(
        path.join(temp, directory, name.replace(/\.mts$/, ".mjs").replace(/\.ts$/, ".js")),
        compiled.outputText,
      );
    }
  }
  await fs.mkdir(path.join(temp, "netlify/data"), { recursive: true });
  await fs.writeFile(path.join(temp, "netlify/data/networking-seed.json"), "[]");
  await fs.copyFile(
    path.join(root, "netlify/data/21-agustos-wordcloud-seed.json"),
    path.join(temp, "netlify/data/21-agustos-wordcloud-seed.json"),
  );
  await fs.copyFile(
    path.join(root, "netlify/data/21-agustos-network-sample.json"),
    path.join(temp, "netlify/data/21-agustos-network-sample.json"),
  );
  return {
    loadLib: (name) => import(pathToFileURL(path.join(temp, "src/lib", `${name}.js`))),
    load: (name) => import(pathToFileURL(path.join(temp, "netlify/functions", `${name}.mjs`))),
    blobs: await import(pathToFileURL(mock)),
    cleanup: () => fs.rm(temp, { recursive: true, force: true }),
  };
}
