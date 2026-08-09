export interface SelectTriggerRect {
  bottom: number;
  left: number;
  top: number;
  width: number;
}

export interface SelectMenuPosition {
  bottom?: number;
  left: number;
  maxHeight: number;
  top?: number;
  width: number;
}

export function positionSelectMenu(
  trigger: SelectTriggerRect,
  viewportHeight: number,
): SelectMenuPosition;
