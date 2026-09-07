import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const component = read("src/components/combobox/combobox.tsx");
const entry = read("src/index.ts");
const styles = read("src/components.css");

test("Combobox is public and exposes the accessible editable-listbox contract", () => {
  assert.match(entry, /export \{ Combobox \}/);
  assert.match(component, /role="combobox"/);
  assert.match(component, /aria-autocomplete="list"/);
  assert.match(component, /role="listbox"/);
  assert.match(component, /role="option"/);
  assert.match(component, /aria-activedescendant=/);
  assert.match(component, /aria-invalid=/);
  assert.match(component, /aria-errormessage=/);
});

test("Combobox supports async filtering, rich options, empty content, and portal positioning", () => {
  for (const contract of ["filterOptions", "showOptions", "renderOption", "emptyMessage", "menuHeader", "menuFooter"]) {
    assert.match(component, new RegExp(`\\b${contract}\\b`));
  }
  assert.match(component, /createPortal\(/);
  assert.match(component, /positionSelectMenu\(/);
  assert.match(component, /captureSelectLayerContext\(/);
  assert.match(styles, /\.mk-combobox-menu\s*\{[^}]*position:\s*fixed;/s);
  assert.match(styles, /\.mk-combobox-options\s*\{[^}]*overflow-y:\s*auto;/s);
});

test("Combobox forwards caller keyboard handling before its internal behavior", () => {
  const handler = component.slice(component.indexOf("const handleKeyDown"), component.indexOf("const menuMounted"));
  assert.ok(handler.indexOf("onKeyDown?.(event)") < handler.indexOf("event.defaultPrevented"));
  assert.match(handler, /event\.nativeEvent\.isComposing/);
  assert.match(handler, /ArrowDown/);
  assert.match(handler, /ArrowUp/);
  assert.match(handler, /Escape/);
  assert.match(handler, /event\.stopPropagation\(\)/);
  assert.match(handler, /onSubmit\(query\)/);
});

test("clearing text clears an existing selection through the public callback", () => {
  const updater = component.slice(component.indexOf("const updateInput"), component.indexOf("const choose"));
  assert.match(updater, /next === "" && selectedValue !== ""/);
  assert.match(updater, /onChange\?\.\("", null\)/);
});

test("Combobox only opens from input events or an options-availability transition", () => {
  const availabilityEffect = component.match(/React\.useEffect\(\(\) => \{\s*const optionsAvailable[\s\S]*?\}, \[disabled, showOptions\]\);/)?.[0] ?? "";
  assert.ok(availabilityEffect, "options availability effect was not found");
  assert.match(availabilityEffect, /becameAvailable/);
  assert.match(availabilityEffect, /else if \(becameAvailable/);
  assert.doesNotMatch(availabilityEffect, /\[close, disabled, openMenu, showOptions\]/);
});
