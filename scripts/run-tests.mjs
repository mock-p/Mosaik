import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scripts = fileURLToPath(new URL(".", import.meta.url));
const tests = readdirSync(scripts)
  .filter((name) => name.endsWith(".test.mjs"))
  .sort()
  .map((name) => fileURLToPath(new URL(name, import.meta.url)));
const result = spawnSync(process.execPath, ["--test", "--test-concurrency=1", ...tests], {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  stdio: "inherit",
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
