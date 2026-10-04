export type DefinitionReason = "hover" | "focus" | "click";
export type DefinitionToggleSource = "mouse" | "touch" | "pen" | "keyboard";
export type DefinitionSide = "top" | "bottom" | "left" | "right";

export function hasDefinitionReason(reasons: readonly DefinitionReason[], reason: DefinitionReason): boolean;
export function addDefinitionReason(reasons: readonly DefinitionReason[], reason: DefinitionReason): DefinitionReason[];
export function removeDefinitionReason(reasons: readonly DefinitionReason[], reason: DefinitionReason): DefinitionReason[];
export function toggleDefinitionReasons(
  reasons: readonly DefinitionReason[],
  source: DefinitionToggleSource,
): DefinitionReason[];
export function isDefinitionOpen(reasons: readonly DefinitionReason[]): boolean;
export function isHoverPointer(pointerType: string | null | undefined): boolean;
export function definitionTriggerAria(
  open: boolean,
  mounted: boolean,
  layerId: string,
  descriptionId: string | undefined,
  describedBy: string | undefined,
): { controls?: string; describedBy?: string; expanded: boolean };

export interface DefinitionRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export function computeDefinitionPosition(input: {
  anchor: DefinitionRect;
  layer: { width: number; height: number };
  viewport: { width: number; height: number };
  placement?: DefinitionSide;
  gap?: number;
  margin?: number;
  pointerInset?: number;
}): { top: number; left: number; placement: DefinitionSide; pointerOffset: number };

export function isDefinitionEventInside(
  trigger: Node | null | undefined,
  layer: Node | null | undefined,
  target: Node | null | undefined,
): boolean;
