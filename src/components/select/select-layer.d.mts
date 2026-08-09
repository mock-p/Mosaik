export interface SelectLayerContext {
  className?: "dark";
  cornerAxis?: string;
  style: Record<string, string> & { fontFamily: string };
}

export function captureSelectLayerContext(
  trigger: Element,
  readComputedStyle: typeof getComputedStyle,
): SelectLayerContext;
export function isSelectEventInside(root: Node | null, menu: Node | null, target: Node): boolean;
export function selectAria(open: boolean, mounted: boolean, focusIndex: number, menuId: string): {
  activeDescendant?: string;
  controls?: string;
  expanded: boolean;
};
export function watchSelectGeometry(
  target: Window,
  trigger: Element,
  update: () => void,
  ResizeObserverClass?: typeof ResizeObserver,
): () => void;
export function watchSelectContext(
  root: Node,
  update: () => void,
  MutationObserverClass: typeof MutationObserver,
): () => void;
