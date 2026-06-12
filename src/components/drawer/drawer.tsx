import * as React from "react";
import { cx } from "../../internal/cx";
import { CrossGlyph } from "../../internal/glyphs";
import { Button } from "../button";

export interface DrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  open?: boolean;
  /** Called from the × button, the scrim and Escape. */
  onClose?: () => void;
  title?: React.ReactNode;
  /** Footer actions, right-aligned. */
  footer?: React.ReactNode;
  /**
   * Cover the whole viewport instead of the nearest positioned parent.
   * @default false
   */
  fixed?: boolean;
}

/**
 * Side drawer — slides in from the right over a scrim, same easing
 * as the Mosaik modals. Stays mounted so the exit animation plays.
 */
export function Drawer({
  open = false,
  onClose,
  title,
  footer,
  fixed = false,
  className,
  children,
  ...rest
}: DrawerProps) {
  React.useEffect(() => {
    if (!open || onClose == null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={cx("mk-drawer-root", open && "open", fixed && "fixed", className)} {...rest}>
      <div className="mk-drawer-scrim" onClick={onClose} />
      <aside className="mk-drawer" aria-label={typeof title === "string" ? title : undefined}>
        <div className="mk-drawer-head">
          <div className="mk-drawer-title">{title}</div>
          {onClose != null && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              icon={<CrossGlyph size={11} />}
              aria-label="Fermer"
              onClick={onClose}
            />
          )}
        </div>
        <div className="mk-drawer-body">{children}</div>
        {footer != null && <div className="mk-drawer-foot">{footer}</div>}
      </aside>
    </div>
  );
}
