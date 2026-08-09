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
