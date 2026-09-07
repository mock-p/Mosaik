import assert from "node:assert/strict";
import test from "node:test";
import {
  filterComboboxOptions,
  firstEnabledOptionIndex,
  moveComboboxOption,
  optionText,
} from "../src/components/combobox/combobox-state.mjs";

const options = [
  { value: "atlas", label: "Atlas", textValue: "Atlas Universe" },
  { value: "disabled", label: "Disabled", disabled: true },
  { value: "forge", label: "Forge" },
];

test("combobox text supports rich labels and case-insensitive substring filtering", () => {
  assert.equal(optionText(options[0]), "Atlas Universe");
  assert.equal(optionText({ value: "fallback", label: { rich: true } }), "fallback");
  assert.deepEqual(filterComboboxOptions(options, " UNIVER ").map((option) => option.value), ["atlas"]);
  assert.equal(filterComboboxOptions(options, ""), options);
});

test("combobox keyboard movement skips disabled options and wraps", () => {
  assert.equal(firstEnabledOptionIndex(options), 0);
  assert.equal(moveComboboxOption(options, 0, 1), 2);
  assert.equal(moveComboboxOption(options, 2, 1), 0);
  assert.equal(moveComboboxOption(options, 0, -1), 2);
  assert.equal(moveComboboxOption([{ value: "no", disabled: true }], -1, 1), -1);
});
