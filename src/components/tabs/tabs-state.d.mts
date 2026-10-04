export interface TabsStateItem {
  value: string;
  disabled?: boolean;
  focusableDisabled?: boolean;
}

export declare function canActivateTab(item: TabsStateItem | undefined): boolean;
export declare function getNavigableTabs<T extends TabsStateItem>(items: T[]): T[];
export declare function getNextNavigableTab<T extends TabsStateItem>(
  items: T[],
  current: string,
  direction: 1 | -1 | "first" | "last",
): T | undefined;
export declare function createTabsInteractionController(
  items: TabsStateItem[],
  handlers: { select(value: string): void; focus(value: string): void },
): {
  activate(value: string): void;
  keyDown(current: string, key: string): boolean;
};
export declare function getTabRelationshipIds(
  baseId: string,
  index: number,
  item: TabsStateItem & { tabId?: string; controls?: string; panel?: unknown },
  options?: { externalPanels?: boolean },
): { tabId: string; panelId: string; controls?: string; labelledBy: string };
export declare function toTabIdSegment(value: string): string;
export declare function getTabId(tabsId: string, value: string): string;
export declare function getTabPanelId(tabsId: string, value: string): string;
export interface TabPanelProps {
  id: string;
  role: "tabpanel";
  "aria-labelledby": string;
  tabIndex: 0;
}
export declare function getTabPanelProps(tabsId: string, value: string): TabPanelProps;
export interface TabsScrollMetrics {
  scrollLeft: number;
  clientWidth: number;
  scrollWidth: number;
}
export declare function getTabsOverflow(
  metrics: TabsScrollMetrics,
  tolerance?: number,
): { start: boolean; end: boolean };
export declare function getTabScrollLeft(
  metrics: TabsScrollMetrics,
  tab: { left: number; width: number },
  inset?: number,
): number | null;
export declare function getTabsPageScrollLeft(
  metrics: TabsScrollMetrics,
  direction: 1 | -1,
  ratio?: number,
): number;
