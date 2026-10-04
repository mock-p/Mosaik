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

/** Turns a tab value into a safe HTML id segment. */
export function toTabIdSegment(value) {
  return String(value).replace(/[^A-Za-z0-9_-]/g, "-");
}

/** ID of the tab button for `value` in the Tabs whose `id` is `tabsId` (external panels). */
export function getTabId(tabsId, value) {
  return `${tabsId}-tab-${toTabIdSegment(value)}`;
}

/** ID of the panel controlled by the tab `value` in the Tabs whose `id` is `tabsId`. */
export function getTabPanelId(tabsId, value) {
  return `${tabsId}-panel-${toTabIdSegment(value)}`;
}

/**
 * Props of a panel rendered outside of `<Tabs externalPanels id={tabsId}>`:
 * `<section {...getTabPanelProps(tabsId, active)}>`.
 */
export function getTabPanelProps(tabsId, value) {
  return {
    id: getTabPanelId(tabsId, value),
    role: "tabpanel",
    "aria-labelledby": getTabId(tabsId, value),
    tabIndex: 0,
  };
}

export function getTabRelationshipIds(baseId, index, item, options = {}) {
  if (options.externalPanels) {
    const tabId = item.tabId ?? getTabId(baseId, item.value);
    const panelId = item.controls ?? getTabPanelId(baseId, item.value);
    return { tabId, panelId, controls: panelId, labelledBy: tabId };
  }
  const tabId = item.tabId ?? `${baseId}-tab-${index}`;
  const generatedPanelId = `${baseId}-panel-${index}`;
  const panelId = item.panel !== undefined && item.controls
    ? item.controls
    : generatedPanelId;
  return {
    tabId,
    panelId,
    controls: item.controls ?? (item.panel !== undefined ? panelId : undefined),
    labelledBy: tabId,
  };
}

/** Which edges of a horizontally scrolling tab list hide tabs. */
export function getTabsOverflow({ scrollLeft, clientWidth, scrollWidth }, tolerance = 1) {
  const max = Math.max(0, scrollWidth - clientWidth);
  if (max <= tolerance) return { start: false, end: false };
  return { start: scrollLeft > tolerance, end: scrollLeft < max - tolerance };
}

function clampScroll(value, { clientWidth, scrollWidth }) {
  return Math.min(Math.max(0, Math.round(value)), Math.max(0, scrollWidth - clientWidth));
}

/**
 * Scroll position that shows the whole tab (`left`/`width` in list coordinates) clear of the
 * edge fades (`inset`), or `null` when it is already visible.
 */
export function getTabScrollLeft(metrics, { left, width }, inset = 40) {
  const { scrollLeft, clientWidth, scrollWidth } = metrics;
  if (scrollWidth - clientWidth <= 1) return null;
  const room = Math.max(0, Math.min(inset, (clientWidth - width) / 2));
  let next = scrollLeft;
  if (left - room < scrollLeft) next = left - room;
  else if (left + width + room > scrollLeft + clientWidth) next = left + width + room - clientWidth;
  next = clampScroll(next, metrics);
  return Math.abs(next - scrollLeft) < 1 ? null : next;
}

/** Scroll position after one scroll-button press (`direction` -1 = towards the start). */
export function getTabsPageScrollLeft(metrics, direction, ratio = 0.7) {
  return clampScroll(metrics.scrollLeft + direction * Math.max(1, metrics.clientWidth * ratio), metrics);
}
