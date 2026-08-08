import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "src");
const output = resolve(root, "dist");

await mkdir(output, { recursive: true });
await Promise.all(
  ["styles.css", "theme.css", "components.css"].map((file) =>
    copyFile(resolve(source, file), resolve(output, file)),
  ),
);

// tsup/rollup strips module directives from bundled entrypoints. Next.js relies
// on this directive to treat the package as a client boundary, so finalize the
// generated bundle explicitly after tsup has written it.
const bundlePath = resolve(output, "index.js");
const bundle = await readFile(bundlePath, "utf8");
if (!bundle.startsWith('"use client";')) {
  await writeFile(bundlePath, `"use client";\n${bundle}`, "utf8");
}
