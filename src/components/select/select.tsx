import * as React from "react";
import { cx } from "../../internal/cx";
import { FieldShell, type FieldStatus } from "../field";
import { Triangle } from "../triangle";

export interface SelectOption {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  options: Array<SelectOption | string>;
  /** Multi-select: selections render as chips in the trigger. */
  multiple?: boolean;
  /** Controlled value — string (single) or string[] (multi). */
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  /** Chips shown before collapsing into "+N". @default 3 */
  maxChips?: number;
  disabled?: boolean;
  label?: React.ReactNode;
  labelHint?: React.ReactNode;
  helper?: React.ReactNode;
  status?: FieldStatus;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

function toArray(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function normalize(option: SelectOption | string): SelectOption {
  return typeof option === "string" ? { value: option } : option;
}

/**
 * Mosaik Select — custom dropdown, single + multi.
 * Asymmetric-corner panel, triangle chevron that flips open,
 * triangle marker on the single selection, Mosaik checkboxes + chips in multi.
 */
export function Select({
  options,
  multiple = false,
  value,
  defaultValue,
  onChange,
  placeholder = "Select…",
  maxChips = 3,
  disabled = false,
  label,
  labelHint,
  helper,
  status,
  id,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const items = React.useMemo(() => options.map(normalize), [options]);
  const autoId = React.useId();
  const triggerId = id ?? autoId;

  const [open, setOpen] = React.useState(false);
  const [focusIdx, setFocusIdx] = React.useState(-1);
  const [internal, setInternal] = React.useState<string[]>(() =>
    toArray(defaultValue),
  );
  const selected = value !== undefined ? toArray(value) : internal;

  const rootRef = React.useRef<HTMLDivElement>(null);

  const close = React.useCallback(() => {
    setOpen(false);
    setFocusIdx(-1);
  }, []);

  const openMenu = () => {
    setOpen(true);
    setFocusIdx(items.findIndex((o) => selected.includes(o.value)));
  };

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open, close]);

  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    let next: string[];
    if (multiple) {
      next = selected.includes(option.value)
        ? selected.filter((v) => v !== option.value)
        : [...selected, option.value];
    } else {
      next = [option.value];
      close();
    }
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const moveFocus = (delta: number) => {
    const enabled = items
      .map((o, i) => (o.disabled ? -1 : i))
      .filter((i) => i >= 0);
    if (enabled.length === 0) return;
    const pos = enabled.indexOf(focusIdx);
    const nextPos = Math.min(Math.max(pos + delta, 0), enabled.length - 1);
    setFocusIdx(
      enabled[pos === -1 && delta < 0 ? enabled.length - 1 : nextPos],
    );
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      moveFocus(event.key === "ArrowDown" ? 1 : -1);
    } else if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      if (focusIdx >= 0) choose(items[focusIdx]);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      close();
    }
  };

  const selectedItems = items.filter((o) => selected.includes(o.value));
  const labelOf = (o: SelectOption) => o.label ?? o.value;

  let valueContent: React.ReactNode;
  if (selectedItems.length === 0) {
    valueContent = placeholder;
  } else if (!multiple) {
    valueContent = labelOf(selectedItems[0]);
  } else {
    valueContent = (
      <>
        {selectedItems.slice(0, maxChips).map((o) => (
          <span key={o.value} className="mk-chip">
            {labelOf(o)}
          </span>
        ))}
        {selectedItems.length > maxChips && (
          <span className="mk-chip more">
            +{selectedItems.length - maxChips}
          </span>
        )}
      </>
    );
  }

  return (
    <FieldShell
      label={label}
      labelHint={labelHint}
      helper={helper}
      status={status}
      htmlFor={triggerId}
      labelAsDiv
      className={className}
    >
      <div
        ref={rootRef}
        className={cx("mk-select", multiple && "multi", open && "open")}
      >
        <button
          type="button"
          id={triggerId}
          className="mk-select-trigger"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          onClick={() => (open ? close() : openMenu())}
          onKeyDown={onKeyDown}
        >
          <span
            className={cx(
              "mk-select-value",
              selectedItems.length === 0 && "placeholder",
            )}
          >
            {valueContent}
          </span>
          <span className="mk-chev">
            <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true">
              <path
                d="M3.2 1.5 H8.8 Q11 1.5 9.78 3.33 L6 9 L2.22 3.33 Q1 1.5 3.2 1.5 Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </button>
        <div
          className="mk-select-menu"
          role="listbox"
          aria-multiselectable={multiple || undefined}
        >
          {items.map((option, i) => {
            const isSelected = selected.includes(option.value);
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                className={cx(
                  "mk-select-option",
                  isSelected && "selected",
                  i === focusIdx && "focused",
                  option.disabled && "is-disabled",
                )}
                onClick={() => choose(option)}
                onMouseMove={() => {
                  if (!option.disabled && focusIdx !== i) setFocusIdx(i);
                }}
              >
                {labelOf(option)}
                {!multiple && isSelected && (
                  <Triangle
                    size={11}
                    direction="right"
                    className="mk-opt-marker"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </FieldShell>
  );
}
