import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

// Run the real function handlers and storage logic against only in-memory data.
export async function functionSandbox() {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "notwork-event-regression-"));
  await fs.writeFile(path.join(temp, "package.json"), '{"type":"module"}');
  const mock = path.join(temp, "memory-blobs.mjs");
  await fs.copyFile(new URL("./memory-blobs.mjs", import.meta.url), mock);
  for (const directory of ["netlify/functions", "src/lib"]) {
    await fs.mkdir(path.join(temp, directory), { recursive: true });
    for (const name of await fs.readdir(path.join(root, directory))) {
      if (!/\.(mts|ts)$/.test(name)) continue;
      const source = (await fs.readFile(path.join(root, directory, name), "utf8"))
        .replaceAll('"@netlify/blobs"', JSON.stringify(pathToFileURL(mock).href))
        .replace(/(from\s+["'][^"']+)\.ts(["'])/g, "$1.js$2");
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
    load: (name) => import(pathToFileURL(path.join(temp, "netlify/functions", `${name}.mjs`))),
    blobs: await import(pathToFileURL(mock)),
    cleanup: () => fs.rm(temp, { recursive: true, force: true }),
  };
}
