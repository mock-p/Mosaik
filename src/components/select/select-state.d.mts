interface SelectStateItem {
  value: string;
  label?: unknown;
  disabled?: boolean;
}
export function moveEnabledIndex(items: SelectStateItem[], currentIndex: number, delta: number): number;
export function findTypeaheadIndex(items: SelectStateItem[], currentIndex: number, query: string): number;
export function toggleSelectValue(selected: string[], optionValue: string, multiple: boolean): string[];
