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
