import * as React from "react";
import { createPortal } from "react-dom";
import { cx } from "../../internal/cx";
import { FieldShell, type FieldStatus } from "../field";
import { Triangle } from "../triangle";
import {
  positionSelectMenu,
  type SelectMenuPosition,
} from "./select-position.mjs";

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
  name?: string;
  required?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
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
  name,
  required = false,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
}: SelectProps) {
  const items = React.useMemo(() => options.map(normalize), [options]);
  const autoId = React.useId();
  const triggerId = id ?? autoId;
  const labelId = label != null ? `${triggerId}-label` : undefined;
  const helperId = helper != null ? `${triggerId}-helper` : undefined;
  const menuId = `${triggerId}-listbox`;
  const describedBy = [ariaDescribedBy, helperId].filter(Boolean).join(" ") || undefined;

  const [open, setOpen] = React.useState(false);
  const [focusIdx, setFocusIdx] = React.useState(-1);
  const [menuPosition, setMenuPosition] = React.useState<SelectMenuPosition>();
  const [internal, setInternal] = React.useState<string[]>(() =>
    toArray(defaultValue),
  );
  const selected = value !== undefined ? toArray(value) : internal;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const typeaheadRef = React.useRef("");
  const typeaheadTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const close = React.useCallback(() => {
    setOpen(false);
    setFocusIdx(-1);
  }, []);

  const openMenu = (edge?: "first" | "last") => {
    setOpen(true);
    const enabled = items
      .map((option, index) => (option.disabled ? -1 : index))
      .filter((index) => index >= 0);
    const selectedIndex = items.findIndex((option) => !option.disabled && selected.includes(option.value));
    setFocusIdx(
      edge === "first"
        ? (enabled[0] ?? -1)
        : edge === "last"
          ? (enabled[enabled.length - 1] ?? -1)
          : selectedIndex >= 0
            ? selectedIndex
            : (enabled[0] ?? -1),
    );
  };

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) close();
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open, close]);

  React.useEffect(() => {
    if (!open) {
      setMenuPosition(undefined);
      return;
    }
    const updateMenuPosition = () => {
      const trigger = triggerRef.current;
      if (trigger) setMenuPosition(positionSelectMenu(trigger.getBoundingClientRect(), window.innerHeight));
    };
    updateMenuPosition();
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [open]);

  React.useEffect(() => () => clearTimeout(typeaheadTimer.current), []);

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
    const start = pos < 0 ? (delta > 0 ? -1 : 0) : pos;
    const nextPos = (start + delta + enabled.length) % enabled.length;
    setFocusIdx(enabled[nextPos]);
  };

  const moveToEdge = (edge: "first" | "last") => {
    const enabled = items
      .map((option, index) => (option.disabled ? -1 : index))
      .filter((index) => index >= 0);
    setFocusIdx(edge === "first" ? (enabled[0] ?? -1) : (enabled[enabled.length - 1] ?? -1));
  };

  const typeahead = (key: string) => {
    clearTimeout(typeaheadTimer.current);
    typeaheadRef.current += key.toLocaleLowerCase();
    typeaheadTimer.current = setTimeout(() => {
      typeaheadRef.current = "";
    }, 600);
    const query = typeaheadRef.current;
    const start = Math.max(focusIdx, -1);
    for (let offset = 1; offset <= items.length; offset += 1) {
      const index = (start + offset) % items.length;
      const option = items[index];
      const text = typeof option.label === "string" ? option.label : option.value;
      if (!option.disabled && text.toLocaleLowerCase().startsWith(query)) {
        if (!open) setOpen(true);
        setFocusIdx(index);
        return;
      }
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu(event.key === "ArrowUp" ? "last" : "first");
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
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!open) openMenu(event.key === "Home" ? "first" : "last");
      else moveToEdge(event.key === "Home" ? "first" : "last");
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeahead(event.key);
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
      labelId={labelId}
      helperId={helperId}
      className={className}
    >
      <div
        ref={rootRef}
        className={cx("mk-select", multiple && "multi", open && "open")}
      >
        <button
          ref={triggerRef}
          type="button"
          id={triggerId}
          className="mk-select-trigger"
          disabled={disabled}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel == null ? (ariaLabelledBy ?? labelId) : ariaLabelledBy}
          aria-describedby={describedBy}
          aria-controls={menuId}
          aria-activedescendant={open && focusIdx >= 0 ? `${menuId}-option-${focusIdx}` : undefined}
          aria-invalid={status === "error" || undefined}
          aria-errormessage={status === "error" ? helperId : undefined}
          aria-required={required || undefined}
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
        {open && menuPosition && createPortal(<div
          ref={menuRef}
          id={menuId}
          className={cx("mk-select-menu", "open", multiple && "multi")}
          role="listbox"
          style={{
            bottom: menuPosition.bottom,
            left: menuPosition.left,
            maxHeight: menuPosition.maxHeight,
            top: menuPosition.top,
            width: menuPosition.width,
          }}
          aria-labelledby={ariaLabel == null ? (ariaLabelledBy ?? labelId) : undefined}
          aria-multiselectable={multiple || undefined}
        >
          {items.map((option, i) => {
            const isSelected = selected.includes(option.value);
            return (
              <div
                key={option.value}
                id={`${menuId}-option-${i}`}
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
        </div>, document.body)}
        {name != null &&
          selected.map((selectedValue) => (
            <input key={selectedValue} type="hidden" name={name} value={selectedValue} />
          ))}
      </div>
    </FieldShell>
  );
}
