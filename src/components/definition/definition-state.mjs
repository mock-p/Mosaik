/**
 * Pure open/close bookkeeping for `Definition`.
 * The popover is open while at least one reason holds it open:
 * - "hover": mouse pointer over the trigger or the popover (after the open delay);
 * - "focus": keyboard focus reached the trigger;
 * - "click": the user pinned it with a click, a tap, Enter or Space.
 */

export function hasDefinitionReason(reasons, reason) {
  return reasons.includes(reason);
}

export function addDefinitionReason(reasons, reason) {
  return reasons.includes(reason) ? reasons : [...reasons, reason];
}

export function removeDefinitionReason(reasons, reason) {
  return reasons.includes(reason) ? reasons.filter((item) => item !== reason) : reasons;
}

/**
 * Click / tap / Enter / Space on the trigger.
 * - closed → open and pinned;
 * - opened by a mouse hover only → pinned (a click must not close what the user is reading);
 * - otherwise → closed.
 */
export function toggleDefinitionReasons(reasons, source) {
  if (reasons.length === 0) return ["click"];
  if (source === "mouse" && !reasons.includes("click") && reasons.includes("hover")) {
    return [...reasons, "click"];
  }
  return [];
}

export function isDefinitionOpen(reasons) {
  return reasons.length > 0;
}

/** Only a mouse (or pen hovering) drives hover; touch "hover" is a tap side effect. */
export function isHoverPointer(pointerType) {
  return pointerType == null || pointerType === "" || pointerType === "mouse" || pointerType === "pen";
}

export function definitionTriggerAria(open, mounted, layerId, descriptionId, describedBy) {
  return {
    controls: open && mounted ? layerId : undefined,
    describedBy: [describedBy, descriptionId].filter(Boolean).join(" ") || undefined,
    expanded: open,
  };
}

function clamp(value, min, max) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

const OPPOSITE = { bottom: "top", left: "right", right: "left", top: "bottom" };

/**
 * Viewport-aware position for a `position: fixed` layer (top-left coordinates, no transform).
 * Flips to the opposite side when the requested one lacks room and the other has more,
 * clamps along the cross axis and reports where the pointer should aim (`pointerOffset`,
 * in px from the layer's left edge for top/bottom, from its top edge for left/right).
 */
export function computeDefinitionPosition({
  anchor,
  layer,
  viewport,
  placement = "top",
  gap = 8,
  margin = 8,
  pointerInset = 14,
}) {
  const room = {
    bottom: viewport.height - anchor.bottom - gap - margin,
    left: anchor.left - gap - margin,
    right: viewport.width - anchor.right - gap - margin,
    top: anchor.top - gap - margin,
  };
  const vertical = placement === "top" || placement === "bottom";
  const need = vertical ? layer.height : layer.width;
  let side = placement;
  if (room[side] < need && room[OPPOSITE[side]] > room[side]) side = OPPOSITE[side];

  if (vertical) {
    const center = anchor.left + anchor.width / 2;
    const left = clamp(center - layer.width / 2, margin, viewport.width - margin - layer.width);
    const top = side === "top" ? anchor.top - gap - layer.height : anchor.bottom + gap;
    const pointerOffset = clamp(center - left, pointerInset, layer.width - pointerInset);
    return { left, placement: side, pointerOffset, top };
  }
  const middle = anchor.top + anchor.height / 2;
  const top = clamp(middle - layer.height / 2, margin, viewport.height - margin - layer.height);
  const left = side === "left" ? anchor.left - gap - layer.width : anchor.right + gap;
  const pointerOffset = clamp(middle - top, pointerInset, layer.height - pointerInset);
  return { left, placement: side, pointerOffset, top };
}

/** Event containment across the inline trigger and the body-portaled popover. */
export function isDefinitionEventInside(trigger, layer, target) {
  return Boolean(target && (trigger?.contains(target) || layer?.contains(target)));
}
