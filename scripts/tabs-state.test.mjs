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

  assert.deepEqual(
    getTabRelationshipIds("settings-tabs", 2, {
      value: "billing",
      tabId: "billing-tab",
      controls: "billing-panel",
      panel: "Billing panel",
    }),
    {
      tabId: "billing-tab",
      panelId: "billing-panel",
      controls: "billing-panel",
      labelledBy: "billing-tab",
    },
  );
});

test("external panels: value-based ids shared by the tab and getTabPanelProps", async () => {
  const { getTabId, getTabPanelId, getTabPanelProps } = await import("../src/components/tabs/tabs-state.mjs");
  assert.equal(getTabId("server-tabs", "settings"), "server-tabs-tab-settings");
  assert.equal(getTabPanelId("server-tabs", "settings"), "server-tabs-panel-settings");
  assert.equal(getTabId("t", "a b/c"), "t-tab-a-b-c", "values are made id-safe");
  assert.deepEqual(getTabPanelProps("server-tabs", "settings"), {
    id: "server-tabs-panel-settings",
    role: "tabpanel",
    "aria-labelledby": "server-tabs-tab-settings",
    tabIndex: 0,
  });
  assert.deepEqual(
    getTabRelationshipIds("server-tabs", 4, { value: "settings" }, { externalPanels: true }),
    {
      tabId: "server-tabs-tab-settings",
      panelId: "server-tabs-panel-settings",
      controls: "server-tabs-panel-settings",
      labelledBy: "server-tabs-tab-settings",
    },
  );
  assert.equal(
    getTabRelationshipIds("x", 0, { value: "a", tabId: "own-tab", controls: "own-panel" }, { externalPanels: true }).controls,
    "own-panel",
    "explicit ids still win",
  );
});

test("overflow edges, active-tab reveal and page scrolling", async () => {
  const { getTabsOverflow, getTabScrollLeft, getTabsPageScrollLeft } = await import("../src/components/tabs/tabs-state.mjs");
  assert.deepEqual(getTabsOverflow({ scrollLeft: 0, clientWidth: 400, scrollWidth: 400 }), { start: false, end: false });
  assert.deepEqual(getTabsOverflow({ scrollLeft: 0, clientWidth: 300, scrollWidth: 500 }), { start: false, end: true });
  assert.deepEqual(getTabsOverflow({ scrollLeft: 100, clientWidth: 300, scrollWidth: 500 }), { start: true, end: true });
  assert.deepEqual(getTabsOverflow({ scrollLeft: 200, clientWidth: 300, scrollWidth: 500 }), { start: true, end: false });

  const metrics = { scrollLeft: 0, clientWidth: 300, scrollWidth: 500 };
  assert.equal(getTabScrollLeft(metrics, { left: 20, width: 80 }), null, "visible tab: no scroll");
  assert.equal(getTabScrollLeft(metrics, { left: 400, width: 90 }), 200, "last tab: scroll to the end (clamped)");
  assert.equal(getTabScrollLeft(metrics, { left: 260, width: 60 }), 60, "hidden tab clears the 40px fade");
  assert.equal(getTabScrollLeft({ ...metrics, scrollLeft: 200 }, { left: 0, width: 60 }), 0);
  assert.equal(getTabScrollLeft({ scrollLeft: 0, clientWidth: 300, scrollWidth: 300 }, { left: 0, width: 60 }), null);

  assert.equal(getTabsPageScrollLeft({ ...metrics, scrollWidth: 800 }, 1), 210);
  assert.equal(getTabsPageScrollLeft({ ...metrics, scrollLeft: 150 }, 1), 200);
  assert.equal(getTabsPageScrollLeft({ ...metrics, scrollLeft: 150 }, -1), 0);
});
