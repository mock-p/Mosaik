export function optionText(option) {
  if (option.textValue != null) return option.textValue;
  return typeof option.label === "string" ? option.label : option.value;
}

export function filterComboboxOptions(options, query) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return options;
  return options.filter((option) =>
    optionText(option).toLocaleLowerCase().includes(normalized),
  );
}

export function firstEnabledOptionIndex(options) {
  return options.findIndex((option) => !option.disabled);
}

export function moveComboboxOption(options, currentIndex, delta) {
  const enabled = options.flatMap((option, index) => option.disabled ? [] : [index]);
  if (enabled.length === 0) return -1;
  const position = enabled.indexOf(currentIndex);
  const start = position < 0 ? (delta > 0 ? -1 : 0) : position;
  return enabled[(start + delta + enabled.length) % enabled.length];
}
