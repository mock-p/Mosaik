export function captureSelectLayerContext(trigger, readComputedStyle) {
  const computed = readComputedStyle(trigger);
  const style = { fontFamily: computed.fontFamily };
  for (let index = 0; index < computed.length; index += 1) {
    const name = typeof computed.item === "function" ? computed.item(index) : computed[index];
    if (name?.startsWith("--mk-")) style[name] = computed.getPropertyValue(name);
  }
  return {
    className: trigger.closest(".dark") ? "dark" : undefined,
    cornerAxis: trigger.closest("[data-mk-corner]")?.getAttribute("data-mk-corner") ?? undefined,
    style,
  };
}

export function isSelectEventInside(root, menu, target) {
  return Boolean(root?.contains(target) || menu?.contains(target));
}

export function selectAria(open, mounted, focusIndex, menuId) {
  const expanded = open && mounted;
  return {
    activeDescendant: expanded && focusIndex >= 0 ? `${menuId}-option-${focusIndex}` : undefined,
    controls: expanded ? menuId : undefined,
    expanded,
  };
}

export function watchSelectGeometry(target, trigger, update, ResizeObserverClass) {
  target.addEventListener("scroll", update, true);
  target.addEventListener("resize", update);
  const observer = ResizeObserverClass ? new ResizeObserverClass(update) : undefined;
  observer?.observe(trigger);
  return () => {
    target.removeEventListener("scroll", update, true);
    target.removeEventListener("resize", update);
    observer?.disconnect();
  };
}
