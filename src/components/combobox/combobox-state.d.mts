export interface ComboboxStateOption {
  value: string;
  label?: unknown;
  textValue?: string;
  disabled?: boolean;
}

export function optionText(option: ComboboxStateOption): string;
export function filterComboboxOptions<T extends ComboboxStateOption>(options: T[], query: string): T[];
export function firstEnabledOptionIndex(options: ComboboxStateOption[]): number;
export function moveComboboxOption(options: ComboboxStateOption[], currentIndex: number, delta: number): number;
