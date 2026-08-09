import assert from "node:assert/strict";
import { test } from "node:test";
import {
  captureSelectLayerContext,
  isSelectEventInside,
  selectAria,
  watchSelectGeometry,
} from "../src/components/select/select-layer.mjs";
import {
  findTypeaheadIndex,
  moveEnabledIndex,
  toggleSelectValue,
} from "../src/components/select/select-state.mjs";

test("captures dark, corner-axis, custom tokens, and computed font for a body portal", () => {
  const dark = {};
  const corner = { getAttribute: () => "trbl" };
  const trigger = {
    closest: (selector) => selector === ".dark" ? dark : corner,
  };
  const computed = {
    0: "--mk-primary",
    1: "--unrelated",
    fontFamily: "Parkinsans",
    getPropertyValue: (name) => name === "--mk-primary" ? "#123456" : "ignored",
    length: 2,
  };

  assert.deepEqual(captureSelectLayerContext(trigger, () => computed), {
    className: "dark",
    cornerAxis: "trbl",
    style: { "--mk-primary": "#123456", fontFamily: "Parkinsans" },
  });
});

test("outside-click containment accepts either trigger subtree or portaled menu", () => {
  const insideRoot = {};
  const insideMenu = {};
  const outside = {};
  const root = { contains: (target) => target === insideRoot };
  const menu = { contains: (target) => target === insideMenu };
  assert.equal(isSelectEventInside(root, menu, insideRoot), true);
  assert.equal(isSelectEventInside(root, menu, insideMenu), true);
  assert.equal(isSelectEventInside(root, menu, outside), false);
});

test("geometry watcher reacts to scroll, resize, and observed trigger changes, then cleans up", () => {
  const calls = [];
  const target = {
    addEventListener: (...args) => calls.push(["add", ...args]),
    removeEventListener: (...args) => calls.push(["remove", ...args]),
  };
  class Observer {
    constructor(callback) { this.callback = callback; calls.push(["observer", callback]); }
    observe(element) { calls.push(["observe", element]); }
    disconnect() { calls.push(["disconnect"]); }
  }
  const trigger = {};
  const update = () => {};
  const cleanup = watchSelectGeometry(target, trigger, update, Observer);
  assert.deepEqual(calls.slice(0, 4), [
    ["add", "scroll", update, true],
    ["add", "resize", update],
    ["observer", update],
    ["observe", trigger],
  ]);
  cleanup();
  assert.deepEqual(calls.slice(4), [
    ["remove", "scroll", update, true],
    ["remove", "resize", update],
    ["disconnect"],
  ]);
});

test("combobox ARIA only references a mounted listbox and option", () => {
  assert.deepEqual(selectAria(true, false, 2, "menu"), {
    activeDescendant: undefined,
    controls: undefined,
    expanded: false,
  });
  assert.deepEqual(selectAria(true, true, 2, "menu"), {
    activeDescendant: "menu-option-2",
    controls: "menu",
    expanded: true,
  });
});

test("keyboard movement skips disabled options and typeahead wraps", () => {
  const items = [{ value: "Alpha" }, { value: "Beta", disabled: true }, { value: "Charlie" }];
  assert.equal(moveEnabledIndex(items, 0, 1), 2);
  assert.equal(moveEnabledIndex(items, 0, -1), 2);
  assert.equal(findTypeaheadIndex(items, 2, "a"), 0);
});

test("single and multi selection semantics remain distinct", () => {
  assert.deepEqual(toggleSelectValue(["a"], "b", false), ["b"]);
  assert.deepEqual(toggleSelectValue(["a"], "b", true), ["a", "b"]);
  assert.deepEqual(toggleSelectValue(["a", "b"], "a", true), ["b"]);
});
