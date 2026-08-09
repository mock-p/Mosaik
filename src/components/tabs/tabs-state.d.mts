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
