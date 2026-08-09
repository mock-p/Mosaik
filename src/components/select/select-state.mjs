export function moveEnabledIndex(items, currentIndex, delta) {
  const enabled = items.flatMap((item, index) => item.disabled ? [] : [index]);
  if (enabled.length === 0) return -1;
  const position = enabled.indexOf(currentIndex);
  const start = position < 0 ? (delta > 0 ? -1 : 0) : position;
  return enabled[(start + delta + enabled.length) % enabled.length];
}

export function findTypeaheadIndex(items, currentIndex, query) {
  for (let offset = 1; offset <= items.length; offset += 1) {
    const index = (Math.max(currentIndex, -1) + offset) % items.length;
    const item = items[index];
    const text = typeof item.label === "string" ? item.label : item.value;
    if (!item.disabled && text.toLocaleLowerCase().startsWith(query.toLocaleLowerCase())) return index;
  }
  return -1;
}

export function toggleSelectValue(selected, optionValue, multiple) {
  if (!multiple) return [optionValue];
  return selected.includes(optionValue)
    ? selected.filter((value) => value !== optionValue)
    : [...selected, optionValue];
}
