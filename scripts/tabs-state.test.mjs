import assert from "node:assert/strict";
import test from "node:test";

import {
  canActivateTab,
  createTabsInteractionController,
  getNavigableTabs,
  getNextNavigableTab,
  getTabRelationshipIds,
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

test("tabs interaction routes Arrow, Home, and End focus with automatic activation only for enabled tabs", () => {
  const selected = [];
  const focused = [];
  const controller = createTabsInteractionController(items, {
    select: (value) => selected.push(value),
    focus: (value) => focused.push(value),
  });

  assert.equal(controller.keyDown("general", "ArrowRight"), true);
  assert.deepEqual(focused, ["files"]);
  assert.deepEqual(selected, []);

  controller.keyDown("files", "End");
  controller.keyDown("settings", "Home");
  assert.deepEqual(focused, ["files", "settings", "general"]);
  assert.deepEqual(selected, ["settings", "general"]);
});

test("focusable-disabled tabs ignore click, Enter, and Space activation", () => {
  const selected = [];
  const controller = createTabsInteractionController(items, {
    select: (value) => selected.push(value),
    focus() {},
  });

  controller.activate("files");
  assert.equal(controller.keyDown("files", "Enter"), true);
  assert.equal(controller.keyDown("files", " "), true);
  assert.deepEqual(selected, []);

  controller.activate("general");
  assert.deepEqual(selected, ["general"]);
});

test("custom tab IDs remain the label target for internally rendered panels", () => {
  assert.deepEqual(
    getTabRelationshipIds("settings-tabs", 2, {
      value: "billing",
      tabId: "billing-tab",
      panel: "Billing panel",
    }),
    {
      tabId: "billing-tab",
      panelId: "settings-tabs-panel-2",
      controls: "settings-tabs-panel-2",
      labelledBy: "billing-tab",
    },
  );
});
