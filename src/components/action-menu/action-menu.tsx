import * as React from "react";
import { cx } from "../../internal/cx";
import { Button } from "../button";

export type ActionMenuEntry = ActionMenuItem | "separator";

export interface ActionMenuItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Keyboard shortcut hint, e.g. "⌘R". */
  kbd?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface ActionMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: ActionMenuEntry[];
  /** Custom trigger element. Existing click and keyboard handlers are preserved. */
  trigger?: React.ReactElement;
  /** Panel edge aligned with the trigger. @default "right" */
  align?: "left" | "right";
  "aria-label"?: string;
}

const KebabIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <circle cx="7" cy="2.5" r="1.4" fill="currentColor" />
    <circle cx="7" cy="7" r="1.4" fill="currentColor" />
    <circle cx="7" cy="11.5" r="1.4" fill="currentColor" />
  </svg>
);

/** Action menu with managed focus, arrow-key navigation and trigger restoration. */
export function ActionMenu({
  items,
  trigger,
  align = "right",
  className,
  "aria-label": ariaLabel = "Actions",
  ...rest
}: ActionMenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const itemRefs = React.useRef(new Map<number, HTMLButtonElement>());
  const initialFocus = React.useRef<"first" | "last">("first");
  const menuId = React.useId();

  const enabledIndexes = React.useMemo(
    () =>
      items
        .map((item, index) => (item !== "separator" && !item.disabled ? index : -1))
        .filter((index) => index >= 0),
    [items],
  );

  const focusItem = React.useCallback((index: number) => {
    itemRefs.current.get(index)?.focus();
  }, []);

  const close = React.useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => {
        if (triggerRef.current?.isConnected) triggerRef.current.focus();
      });
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const target =
        initialFocus.current === "last"
          ? enabledIndexes[enabledIndexes.length - 1]
          : enabledIndexes[0];
      if (target != null) focusItem(target);
    });
    const onDocumentClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("click", onDocumentClick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onDocumentClick);
    };
  }, [open, enabledIndexes, focusItem, close]);

  const moveFocus = (currentIndex: number, direction: 1 | -1 | "first" | "last") => {
    if (enabledIndexes.length === 0) return;
    let nextPosition: number;
    if (direction === "first") nextPosition = 0;
    else if (direction === "last") nextPosition = enabledIndexes.length - 1;
    else {
      const position = enabledIndexes.indexOf(currentIndex);
      nextPosition = (Math.max(position, 0) + direction + enabledIndexes.length) % enabledIndexes.length;
    }
    focusItem(enabledIndexes[nextPosition]);
  };

  const openFromTrigger = (element: HTMLElement, last = false) => {
    triggerRef.current = element;
    initialFocus.current = last ? "last" : "first";
    setOpen(true);
  };

  const originalTriggerProps = (trigger?.props ?? {}) as React.HTMLAttributes<HTMLElement>;
  const triggerProps: React.HTMLAttributes<HTMLElement> = {
    onClick: (event) => {
      originalTriggerProps.onClick?.(event);
      if (event.defaultPrevented) return;
      triggerRef.current = event.currentTarget;
      setOpen((current) => {
        if (!current) initialFocus.current = "first";
        return !current;
      });
    },
    onKeyDown: (event) => {
      originalTriggerProps.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openFromTrigger(event.currentTarget, event.key === "ArrowUp");
      }
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": menuId,
  };

  return (
    <div ref={rootRef} className={cx("mk-menu", open && "open", className)} {...rest}>
      {trigger != null ? (
        React.cloneElement(
          trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
          triggerProps,
        )
      ) : (
        <Button
          variant="outline"
          size="sm"
          iconOnly
          icon={KebabIcon}
          aria-label={ariaLabel}
          {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        />
      )}
      <div
        id={menuId}
        className={cx("mk-menu-panel", align === "left" && "align-left")}
        role="menu"
        aria-hidden={!open || undefined}
        onKeyDown={(event) => {
          const currentIndex = Number((event.target as HTMLElement).dataset.menuIndex ?? -1);
          if (event.key === "ArrowDown") {
            event.preventDefault();
            moveFocus(currentIndex, 1);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            moveFocus(currentIndex, -1);
          } else if (event.key === "Home") {
            event.preventDefault();
            moveFocus(currentIndex, "first");
          } else if (event.key === "End") {
            event.preventDefault();
            moveFocus(currentIndex, "last");
          } else if (event.key === "Escape") {
            event.preventDefault();
            close(true);
          } else if (event.key === "Tab") {
            close(false);
          }
        }}
      >
        {items.map((item, index) =>
          item === "separator" ? (
            <div key={`sep-${index}`} className="mk-menu-sep" role="separator" />
          ) : (
            <button
              key={index}
              ref={(element) => {
                if (element) itemRefs.current.set(index, element);
                else itemRefs.current.delete(index);
              }}
              type="button"
              role="menuitem"
              data-menu-index={index}
              disabled={item.disabled}
              className={cx("mk-menu-item", item.danger && "is-danger")}
              onClick={() => {
                if (item.disabled) return;
                close(true);
                item.onSelect?.();
              }}
            >
              {item.icon}
              {item.label}
              {item.kbd != null && <span className="mk-menu-kbd">{item.kbd}</span>}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
