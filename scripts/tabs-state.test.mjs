import assert from "node:assert/strict";
import test from "node:test";

import {
  canActivateTab,
  getNavigableTabs,
  getNextNavigableTab,
} from "../src/components/tabs/tabs-state.mjs";

const items = [
  { value: "general" },
  { value: "files", disabled: true, focusableDisabled: true },
  { value: "legacy-disabled", disabled: true },
  { value: "console", disabled: true, focusableDisabled: true },
  { value: "settings" },
];

test("focusable-disabled tabs remain in keyboard navigation while regular disabled tabs do not", () => {
  assert.deepEqual(
    getNavigableTabs(items).map((item) => item.value),
    ["general", "files", "console", "settings"],
  );
  assert.equal(getNextNavigableTab(items, "general", 1).value, "files");
  assert.equal(getNextNavigableTab(items, "files", 1).value, "console");
  assert.equal(getNextNavigableTab(items, "general", "last").value, "settings");
  assert.equal(getNextNavigableTab(items, "settings", 1).value, "general");
});

test("disabled tabs never activate even when they are focusable", () => {
  assert.equal(canActivateTab(items[0]), true);
  assert.equal(canActivateTab(items[1]), false);
  assert.equal(canActivateTab(items[2]), false);
});
