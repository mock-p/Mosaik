import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  addDefinitionReason,
  computeDefinitionPosition,
  definitionTriggerAria,
  isDefinitionEventInside,
  isDefinitionOpen,
  isHoverPointer,
  removeDefinitionReason,
  toggleDefinitionReasons,
} from "../src/components/definition/definition-state.mjs";

const css = readFileSync(new URL("../src/components.css", import.meta.url), "utf8");
const index = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");

test("reasons stack: the popover stays open while any reason holds it", () => {
  let reasons = [];
  assert.equal(isDefinitionOpen(reasons), false);
  reasons = addDefinitionReason(reasons, "hover");
  reasons = addDefinitionReason(reasons, "hover");
  reasons = addDefinitionReason(reasons, "focus");
  assert.deepEqual(reasons, ["hover", "focus"]);
  reasons = removeDefinitionReason(reasons, "hover");
  assert.equal(isDefinitionOpen(reasons), true);
  reasons = removeDefinitionReason(reasons, "focus");
  assert.equal(isDefinitionOpen(reasons), false);
});

test("click toggles: open+pin when closed, pin a mouse-hover popover, otherwise close", () => {
  assert.deepEqual(toggleDefinitionReasons([], "touch"), ["click"]);
  assert.deepEqual(toggleDefinitionReasons([], "keyboard"), ["click"]);
  assert.deepEqual(toggleDefinitionReasons(["hover"], "mouse"), ["hover", "click"]);
  assert.deepEqual(toggleDefinitionReasons(["hover", "click"], "mouse"), []);
  assert.deepEqual(toggleDefinitionReasons(["click"], "touch"), []);
  assert.deepEqual(toggleDefinitionReasons(["focus"], "keyboard"), []);
  assert.deepEqual(toggleDefinitionReasons(["hover"], "keyboard"), []);
});

test("only mouse and pen pointers drive hover; touch hover is a tap side effect", () => {
  assert.equal(isHoverPointer("mouse"), true);
  assert.equal(isHoverPointer("pen"), true);
  assert.equal(isHoverPointer(undefined), true);
  assert.equal(isHoverPointer("touch"), false);
});

test("trigger ARIA only controls a mounted popover and always keeps its description", () => {
  assert.deepEqual(definitionTriggerAria(false, false, "layer", "desc", undefined), {
    controls: undefined,
    describedBy: "desc",
    expanded: false,
  });
  assert.deepEqual(definitionTriggerAria(true, true, "layer", "desc", "hint"), {
    controls: "layer",
    describedBy: "hint desc",
    expanded: true,
  });
  assert.equal(definitionTriggerAria(true, false, "layer", "desc").controls, undefined);
});

const viewport = { width: 1000, height: 800 };
const layer = { width: 264, height: 100 };
const rect = (left, top, width = 60, height = 20) => ({
  left, top, width, height, right: left + width, bottom: top + height,
});

test("position centers above the term and points at its middle", () => {
  const position = computeDefinitionPosition({ anchor: rect(400, 300), layer, viewport, placement: "top" });
  assert.equal(position.placement, "top");
  assert.equal(position.top, 300 - 8 - 100);
  assert.equal(position.left, 430 - 132);
  assert.equal(position.pointerOffset, 132);
});

test("position flips below when there is no room above, and back above near the bottom", () => {
  assert.equal(computeDefinitionPosition({ anchor: rect(400, 40), layer, viewport, placement: "top" }).placement, "bottom");
  const flipped = computeDefinitionPosition({ anchor: rect(400, 760), layer, viewport, placement: "bottom" });
  assert.equal(flipped.placement, "top");
  assert.equal(flipped.top, 760 - 8 - 100);
});

test("position clamps to the viewport edge and moves the pointer to keep aiming at the term", () => {
  const left = computeDefinitionPosition({ anchor: rect(0, 300, 40), layer, viewport, placement: "top" });
  assert.equal(left.left, 8);
  assert.equal(left.pointerOffset, 14, "pointer stays inside the rounded corner inset");
  const right = computeDefinitionPosition({ anchor: rect(940, 300, 50), layer, viewport, placement: "bottom" });
  assert.equal(right.left, 1000 - 8 - 264);
  assert.equal(right.pointerOffset, 965 - (1000 - 8 - 264));
});

test("side placements clamp vertically and flip horizontally", () => {
  const right = computeDefinitionPosition({ anchor: rect(900, 10), layer, viewport, placement: "right" });
  assert.equal(right.placement, "left");
  assert.equal(right.left, 900 - 8 - 264);
  assert.equal(right.top, 8);
});

test("containment accepts the trigger subtree or the portaled popover", () => {
  const node = (children) => ({ contains: (target) => children.includes(target) });
  const inner = {};
  const link = {};
  const trigger = node([inner]);
  const popover = node([link]);
  assert.equal(isDefinitionEventInside(trigger, popover, inner), true);
  assert.equal(isDefinitionEventInside(trigger, popover, link), true);
  assert.equal(isDefinitionEventInside(trigger, popover, {}), false);
  assert.equal(isDefinitionEventInside(trigger, null, null), false);
});

test("Definition is public, styled as a dotted help term, and motion-safe", () => {
  assert.match(index, /export \{ Definition \} from "\.\/components\/definition"/);
  assert.match(css, /\.mk-term \{[^}]*text-decoration-style: dotted/);
  assert.match(css, /\.mk-term \{[^}]*cursor: help/);
  assert.match(css, /\.mk-term:focus-visible \{[^}]*outline: 2px solid/);
  assert.match(css, /\.mk-definition-layer \{[^}]*pointer-events: auto/);
  assert.match(css, /prefers-reduced-motion[\s\S]*\.mk-definition-layer \{ animation: none; \}/);
});
