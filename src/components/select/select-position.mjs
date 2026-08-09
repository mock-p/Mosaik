const GAP = 6;
const VIEWPORT_MARGIN = 24;
const PREFERRED_HEIGHT = 288;

export function positionSelectMenu(trigger, viewportHeight) {
  const spaceBelow = viewportHeight - trigger.bottom - GAP - VIEWPORT_MARGIN;
  const spaceAbove = trigger.top - GAP - VIEWPORT_MARGIN;
  const placeAbove = spaceBelow < PREFERRED_HEIGHT && spaceAbove > spaceBelow;
  const shared = {
    left: trigger.left,
    maxHeight: Math.max(0, Math.min(PREFERRED_HEIGHT, placeAbove ? spaceAbove : spaceBelow)),
    width: trigger.width,
  };

  return placeAbove
    ? { ...shared, bottom: viewportHeight - trigger.top + GAP }
    : { ...shared, top: trigger.bottom + GAP };
}
