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
  onSelect?: () => void;
}

export interface ActionMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: ActionMenuEntry[];
  /**
   * Custom trigger element — receives onClick / aria props.
   * Defaults to the kebab ⋮ outline icon button.
   */
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

/**
 * Action menu (kebab dropdown): Mosaik panel with the same opening
 * animation as the select, keyboard-shortcut hints, danger items.
 * Closes on item select, outside click and Escape.
 */
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

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerProps = {
    onClick: () => setOpen((o) => !o),
    "aria-haspopup": "menu" as const,
    "aria-expanded": open,
  };

  return (
    <div ref={rootRef} className={cx("mk-menu", open && "open", className)} {...rest}>
      {trigger != null ? (
        React.cloneElement(trigger, triggerProps)
      ) : (
        <Button
          variant="outline"
          size="sm"
          iconOnly
          icon={KebabIcon}
          aria-label={ariaLabel}
          {...triggerProps}
        />
      )}
      <div className={cx("mk-menu-panel", align === "left" && "align-left")} role="menu">
        {items.map((item, i) =>
          item === "separator" ? (
            <div key={`sep-${i}`} className="mk-menu-sep" />
          ) : (
            <button
              key={i}
              type="button"
              role="menuitem"
              className={cx("mk-menu-item", item.danger && "is-danger")}
              onClick={() => {
                setOpen(false);
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
