import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("../src/components.css", import.meta.url), "utf8");

function declaration(selector, property) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(block, `missing ${selector} rule`);
  const value = block[1].match(new RegExp(`(?:^|[;\\n])\\s*${property}\\s*:\\s*([^;]+)`));
  assert.ok(value, `missing ${property} in ${selector}`);
  return value[1].trim();
}

test("button sizes expose the 32/44/50px control-height scale", () => {
  assert.deepEqual(
    [".mk-btn-sm", ".mk-btn", ".mk-btn-lg"].map((selector) => declaration(selector, "height")),
    ["32px", "44px", "50px"],
  );
});

test("medium icon-only buttons remain square at the medium control height", () => {
  assert.equal(declaration(".mk-btn-icon", "width"), "44px");
});
