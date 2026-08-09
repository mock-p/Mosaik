export function canActivateTab(item) {
  return item != null && item.disabled !== true;
}

export function getNavigableTabs(items) {
  return items.filter((item) => !item.disabled || item.focusableDisabled);
}

export function getNextNavigableTab(items, current, direction) {
  const navigable = getNavigableTabs(items);
  if (navigable.length === 0) return undefined;

  if (direction === "first") return navigable[0];
  if (direction === "last") return navigable[navigable.length - 1];

  const currentIndex = navigable.findIndex((item) => item.value === current);
  const startIndex = currentIndex < 0 ? 0 : currentIndex;
  return navigable[(startIndex + direction + navigable.length) % navigable.length];
}

export function createTabsInteractionController(items, { select, focus }) {
  function activate(value) {
    const item = items.find((candidate) => candidate.value === value);
    if (canActivateTab(item)) select(value);
  }

  function keyDown(current, key) {
    if (key === "Enter" || key === " ") {
      activate(current);
      return true;
    }

    const direction = key === "ArrowRight"
      ? 1
      : key === "ArrowLeft"
        ? -1
        : key === "Home"
          ? "first"
          : key === "End"
            ? "last"
          : undefined;
    if (direction === undefined) return false;

    const target = getNextNavigableTab(items, current, direction);
    if (!target) return true;
    if (canActivateTab(target)) select(target.value);
    focus(target.value);
    return true;
  }

  return { activate, keyDown };
}
