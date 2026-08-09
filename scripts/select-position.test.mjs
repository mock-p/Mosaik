import assert from "node:assert/strict";
import { test } from "node:test";
import { positionSelectMenu } from "../src/components/select/select-position.mjs";

test("positions the menu below its trigger when the viewport has room", () => {
  assert.deepEqual(
    positionSelectMenu({ bottom: 144, left: 24, top: 100, width: 220 }, 800),
    { left: 24, maxHeight: 288, top: 150, width: 220 },
  );
});

test("flips the menu above and bounds its height when space below is insufficient", () => {
  assert.deepEqual(
    positionSelectMenu({ bottom: 760, left: 24, top: 716, width: 220 }, 800),
    { bottom: 90, left: 24, maxHeight: 288, width: 220 },
  );
});

test("bounds a menu below the trigger to the remaining viewport", () => {
  assert.deepEqual(
    positionSelectMenu({ bottom: 94, left: 24, top: 50, width: 220 }, 160),
    { left: 24, maxHeight: 36, top: 100, width: 220 },
  );
});
