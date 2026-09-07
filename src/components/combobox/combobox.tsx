import * as React from "react";
import { createPortal } from "react-dom";
import { cx } from "../../internal/cx";
import { FieldShell, type FieldStatus } from "../field";
import {
  captureSelectLayerContext,
  isSelectEventInside,
  selectAria,
  watchSelectContext,
  watchSelectGeometry,
  type SelectLayerContext,
} from "../select/select-layer.mjs";
import {
  positionSelectMenu,
  type SelectMenuPosition,
} from "../select/select-position.mjs";
import {
  filterComboboxOptions,
  firstEnabledOptionIndex,
  moveComboboxOption,
  optionText,
} from "./combobox-state.mjs";

export interface ComboboxOption {
  value: string;
  label?: React.ReactNode;
  /** Plain text used for input display and built-in filtering when label is rich content. */
  textValue?: string;
  disabled?: boolean;
}

export interface ComboboxOptionState {
  active: boolean;
  selected: boolean;
}

export interface ComboboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "defaultValue" | "onChange" | "onSubmit" | "size" | "value"
  > {
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string;
  /** The option is null when clearing the input clears the current selection. */
  onChange?: (value: string, option: ComboboxOption | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (value: string) => void;
  /** Use false for remotely filtered options, or supply a custom local filter. */
  filterOptions?: false | ((options: ComboboxOption[], query: string) => ComboboxOption[]);
  /** Additional condition for showing suggestions while the input has focus. @default true */
  showOptions?: boolean;
  onSubmit?: (inputValue: string) => void;
  renderOption?: (option: ComboboxOption, state: ComboboxOptionState) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  menuHeader?: React.ReactNode;
  menuFooter?: React.ReactNode;
  label?: React.ReactNode;
  labelHint?: React.ReactNode;
  helper?: React.ReactNode;
  status?: FieldStatus;
  iconStart?: React.ReactNode;
  /** Accessible name for the options toggle. @default "Toggle options" */
  toggleLabel?: string;
}

function sameMenuPosition(current: SelectMenuPosition | undefined, next: SelectMenuPosition) {
  return current?.bottom === next.bottom &&
    current?.left === next.left &&
    current?.maxHeight === next.maxHeight &&
    current?.top === next.top &&
    current?.width === next.width;
}

function sameLayerContext(current: SelectLayerContext | undefined, next: SelectLayerContext) {
  if (current?.className !== next.className || current?.cornerAxis !== next.cornerAxis) return false;
  const currentEntries = Object.entries(current?.style ?? {});
  const nextEntries = Object.entries(next.style);
  return currentEntries.length === nextEntries.length &&
    nextEntries.every(([name, value]) => current?.style[name] === value);
}

/** Searchable single-select with rich options, keyboard navigation, and a portalled menu. */
export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(
    {
      options,
      value,
      defaultValue = "",
      onChange,
      inputValue,
      defaultInputValue,
      onInputChange,
      filterOptions,
      showOptions = true,
      onSubmit,
      renderOption,
      emptyMessage = "No matching options",
      menuHeader,
      menuFooter,
      label,
      labelHint,
      helper,
      status,
      iconStart,
      toggleLabel = "Toggle options",
      id,
      name,
      required,
      disabled,
      className,
      onFocus,
      onBlur,
      onKeyDown,
      autoComplete = "off",
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...rest
    },
    forwardedRef,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const labelId = label != null ? `${inputId}-label` : undefined;
    const helperId = helper != null ? `${inputId}-helper` : undefined;
    const menuId = `${inputId}-listbox`;
    const describedBy = [ariaDescribedBy, helperId].filter(Boolean).join(" ") || undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const selectedValue = value === undefined ? internalValue : (value ?? "");
    const selectedOption = options.find((option) => option.value === selectedValue);
    const selectedText = selectedOption == null ? "" : optionText(selectedOption);
    const [internalInput, setInternalInput] = React.useState(
      () => defaultInputValue ?? selectedText,
    );
    const [dirty, setDirty] = React.useState(defaultInputValue != null);
    const query = inputValue === undefined ? internalInput : inputValue;
    const filterQuery = inputValue === undefined && !dirty ? "" : query;
    const filteredOptions = React.useMemo(() => {
      if (filterOptions === false) return options;
      if (filterOptions != null) return filterOptions(options, filterQuery);
      return filterComboboxOptions(options, filterQuery);
    }, [filterOptions, filterQuery, options]);
    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const [menuPosition, setMenuPosition] = React.useState<SelectMenuPosition>();
    const [layerContext, setLayerContext] = React.useState<SelectLayerContext>();
    const rootRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const optionRefs = React.useRef(new Map<number, HTMLDivElement>());
    const optionsAvailableRef = React.useRef(showOptions && !disabled);

    React.useImperativeHandle(forwardedRef, () => inputRef.current!);

    const resetUncontrolledInput = React.useCallback(() => {
      if (inputValue !== undefined) return;
      setInternalInput(selectedText);
      setDirty(false);
    }, [inputValue, selectedText]);

    const close = React.useCallback(() => {
      setOpen(false);
      setActiveIndex(-1);
      resetUncontrolledInput();
    }, [resetUncontrolledInput]);

    const openMenu = React.useCallback((edge: "first" | "last" = "first") => {
      if (disabled || !showOptions) return;
      setOpen(true);
      const enabled = filteredOptions.flatMap((option, index) => option.disabled ? [] : [index]);
      const selectedIndex = filteredOptions.findIndex(
        (option) => option.value === selectedValue && !option.disabled,
      );
      setActiveIndex(
        edge === "last"
          ? (enabled[enabled.length - 1] ?? -1)
          : selectedIndex >= 0
            ? selectedIndex
            : (enabled[0] ?? -1),
      );
    }, [disabled, filteredOptions, selectedValue, showOptions]);

    React.useEffect(() => {
      if (inputValue === undefined && document.activeElement !== inputRef.current) {
        setInternalInput(selectedText);
        setDirty(false);
      }
    }, [inputValue, selectedText]);

    React.useEffect(() => {
      const optionsAvailable = showOptions && !disabled;
      const becameAvailable = optionsAvailable && !optionsAvailableRef.current;
      optionsAvailableRef.current = optionsAvailable;
      if (!optionsAvailable) close();
      else if (becameAvailable && document.activeElement === inputRef.current) openMenu();
    }, [disabled, showOptions]);

    React.useEffect(() => {
      if (!open) return;
      const first = firstEnabledOptionIndex(filteredOptions);
      if (activeIndex < 0 || activeIndex >= filteredOptions.length || filteredOptions[activeIndex]?.disabled) {
        setActiveIndex(first);
      }
    }, [activeIndex, filteredOptions, open]);

    React.useEffect(() => {
      optionRefs.current.get(activeIndex)?.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);

    React.useEffect(() => {
      if (!open) return;
      const onDocumentPointerDown = (event: MouseEvent) => {
        if (!isSelectEventInside(rootRef.current, menuRef.current, event.target as Node)) close();
      };
      document.addEventListener("mousedown", onDocumentPointerDown);
      return () => document.removeEventListener("mousedown", onDocumentPointerDown);
    }, [close, open]);

    React.useEffect(() => {
      if (!open) {
        setMenuPosition(undefined);
        return;
      }
      const updateMenuPosition = () => {
        const input = inputRef.current;
        if (input == null) return;
        const nextPosition = positionSelectMenu(input.getBoundingClientRect(), window.innerHeight);
        const nextContext = captureSelectLayerContext(input, window.getComputedStyle);
        setMenuPosition((current) => sameMenuPosition(current, nextPosition) ? current : nextPosition);
        setLayerContext((current) => sameLayerContext(current, nextContext) ? current : nextContext);
      };
      updateMenuPosition();
      const ResizeObserverClass = typeof ResizeObserver === "undefined" ? undefined : ResizeObserver;
      const stopGeometry = watchSelectGeometry(window, inputRef.current!, updateMenuPosition, ResizeObserverClass);
      const stopContext = watchSelectContext(document.documentElement, updateMenuPosition, MutationObserver);
      return () => {
        stopGeometry();
        stopContext();
      };
    }, [open]);

    const updateInput = (next: string) => {
      if (inputValue === undefined) setInternalInput(next);
      setDirty(true);
      onInputChange?.(next);
      if (next === "" && selectedValue !== "") {
        if (value === undefined) setInternalValue("");
        onChange?.("", null);
      }
    };

    const choose = (option: ComboboxOption) => {
      if (option.disabled) return;
      if (value === undefined) setInternalValue(option.value);
      const nextInput = optionText(option);
      if (inputValue === undefined) setInternalInput(nextInput);
      setDirty(false);
      onInputChange?.(nextInput);
      onChange?.(option.value, option);
      setOpen(false);
      setActiveIndex(-1);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.nativeEvent.isComposing) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!open) openMenu(event.key === "ArrowUp" ? "last" : "first");
        else setActiveIndex((current) =>
          moveComboboxOption(filteredOptions, current, event.key === "ArrowDown" ? 1 : -1),
        );
      } else if (event.key === "Enter") {
        if (open && activeIndex >= 0) {
          event.preventDefault();
          choose(filteredOptions[activeIndex]);
        } else if (onSubmit != null) {
          event.preventDefault();
          onSubmit(query);
        }
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === "Tab") {
        close();
      } else if (event.key === "Home" && open) {
        event.preventDefault();
        setActiveIndex(firstEnabledOptionIndex(filteredOptions));
      } else if (event.key === "End" && open) {
        event.preventDefault();
        setActiveIndex(moveComboboxOption(filteredOptions, -1, -1));
      }
    };

    const menuMounted = open && menuPosition != null && layerContext != null;
    const comboboxAria = selectAria(open, menuMounted, activeIndex, menuId);

    return (
      <FieldShell
        label={label}
        labelHint={labelHint}
        helper={helper}
        status={status}
        htmlFor={inputId}
        labelId={labelId}
        helperId={helperId}
        className={className}
      >
        <div ref={rootRef} className={cx("mk-combobox", open && "open")}>
          <div className={cx("mk-input-wrap", iconStart != null && "has-start", "has-end")}>
            <input
              {...rest}
              ref={inputRef}
              id={inputId}
              className="mk-input mk-combobox-input"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-expanded={comboboxAria.expanded}
              aria-controls={comboboxAria.controls}
              aria-activedescendant={comboboxAria.activeDescendant}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabel == null ? (ariaLabelledBy ?? labelId) : ariaLabelledBy}
              aria-describedby={describedBy}
              aria-invalid={status === "error" || undefined}
              aria-errormessage={status === "error" ? helperId : undefined}
              aria-required={required || undefined}
              autoComplete={autoComplete}
              disabled={disabled}
              required={required}
              value={query}
              onFocus={(event) => {
                onFocus?.(event);
                if (!event.defaultPrevented) openMenu();
              }}
              onBlur={(event) => {
                onBlur?.(event);
                if (!event.defaultPrevented) close();
              }}
              onChange={(event) => {
                updateInput(event.target.value);
                if (showOptions) setOpen(true);
                setActiveIndex(firstEnabledOptionIndex(filteredOptions));
              }}
              onKeyDown={handleKeyDown}
            />
            {iconStart != null && <span className="mk-input-start">{iconStart}</span>}
            <button
              type="button"
              className="mk-combobox-toggle"
              aria-label={toggleLabel}
              aria-controls={comboboxAria.controls}
              aria-expanded={comboboxAria.expanded}
              disabled={disabled}
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                inputRef.current?.focus();
                if (open) close();
                else openMenu();
              }}
            >
              <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true">
                <path d="M3.2 1.5 H8.8 Q11 1.5 9.78 3.33 L6 9 L2.22 3.33 Q1 1.5 3.2 1.5 Z" fill="currentColor" />
              </svg>
            </button>
          </div>
          {menuMounted && createPortal(
            <div
              className={layerContext.className}
              data-mk-corner={layerContext.cornerAxis}
              style={layerContext.style as React.CSSProperties}
            >
              <div
                ref={menuRef}
                className="mk-combobox-menu open"
                style={{
                  bottom: menuPosition.bottom,
                  left: menuPosition.left,
                  maxHeight: menuPosition.maxHeight,
                  top: menuPosition.top,
                  width: menuPosition.width,
                }}
              >
                {menuHeader != null && <div className="mk-combobox-menu-header">{menuHeader}</div>}
                <div
                  id={menuId}
                  role="listbox"
                  aria-labelledby={ariaLabel == null ? (ariaLabelledBy ?? labelId) : undefined}
                  className="mk-combobox-options"
                >
                  {filteredOptions.map((option, index) => {
                    const state = {
                      active: index === activeIndex,
                      selected: option.value === selectedValue,
                    };
                    return (
                      <div
                        key={option.value}
                        ref={(element) => {
                          if (element) optionRefs.current.set(index, element);
                          else optionRefs.current.delete(index);
                        }}
                        id={`${menuId}-option-${index}`}
                        role="option"
                        aria-selected={state.selected}
                        aria-disabled={option.disabled || undefined}
                        className={cx(
                          "mk-combobox-option",
                          state.active && "focused",
                          state.selected && "selected",
                          option.disabled && "is-disabled",
                        )}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          choose(option);
                        }}
                        onMouseMove={() => {
                          if (!option.disabled && activeIndex !== index) setActiveIndex(index);
                        }}
                      >
                        <span className="mk-combobox-option-content">
                          {renderOption?.(option, state) ?? option.label ?? option.value}
                        </span>
                        {state.selected && <span className="mk-combobox-check" aria-hidden="true">✓</span>}
                      </div>
                    );
                  })}
                  {filteredOptions.length === 0 && (
                    <div className="mk-combobox-empty">{emptyMessage}</div>
                  )}
                </div>
                {menuFooter != null && <div className="mk-combobox-menu-footer">{menuFooter}</div>}
              </div>
            </div>,
            document.body,
          )}
          {name != null && <input type="hidden" name={name} value={selectedValue} />}
        </div>
      </FieldShell>
    );
  },
);
