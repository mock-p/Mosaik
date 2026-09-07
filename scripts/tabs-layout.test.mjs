import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const component = read("src/components/tabs/tabs.tsx");
const styles = read("src/components.css");

test("Tabs exposes compact and equal-width public layout options", () => {
  assert.match(component, /size\?:\s*"sm"\s*\|\s*"md"/);
  assert.match(component, /equalWidth\?:\s*boolean/);
  assert.match(component, /`mk-tabs-\$\{size\}`/);
  assert.match(component, /equalWidth\s*&&\s*"is-equal"/);
  assert.match(styles, /\.mk-tabs-sm\s*\{/);
  assert.match(styles, /\.mk-tabs\.is-equal \.mk-tab\s*\{[^}]*flex:\s*1 1 0;/s);
});
