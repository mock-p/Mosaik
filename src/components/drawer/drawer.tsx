import * as React from "react";
import { createPortal } from "react-dom";
import { cx } from "../../internal/cx";
import { focusFirst, lockBodyScroll, trapTabKey } from "../../internal/focus";
import { CrossGlyph } from "../../internal/glyphs";
import { Button } from "../button";

export interface DrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  open?: boolean;
  /** Called from the close button, scrim and Escape. */
  onClose?: () => void;
  title?: React.ReactNode;
  /** Footer actions, right-aligned. */
  footer?: React.ReactNode;
  /** Cover the whole viewport instead of the nearest positioned parent. */
  fixed?: boolean;
  /** Portal to `document.body`. Defaults to the value of `fixed`. */
  portal?: boolean;
  /** Accessible label for the close button. @default "Close" */
  closeLabel?: string;
  /** Element focused when the drawer opens. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /**
   * `"right"`: full-height side panel. `"bottom"`: sheet sized to its content (85% of the
   * viewport at most) with a drag handle that closes it when pulled down. @default "right"
   */
  placement?: "right" | "bottom";
}

/** Distance (px) a bottom sheet must be pulled down to close. */
export const DRAWER_DRAG_CLOSE_DISTANCE = 80;

/** Modal side drawer with focus containment, restoration and optional body portal. */
export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    open = false,
    onClose,
    title,
    footer,
    fixed = false,
    portal,
    closeLabel = "Close",
    initialFocusRef,
    placement = "right",
    className,
    children,
    "aria-label": ariaLabel,
    ...rest
  },
  forwardedRef,
) {
  const drawerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => drawerRef.current as HTMLDivElement);
  const reactId = React.useId();
  const titleId = `${reactId}-title`;
  const shouldPortal = portal ?? fixed;
  const [portalReady, setPortalReady] = React.useState(false);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => setPortalReady(true), []);

  // Bottom sheet: pull the handle down to close (the close button, scrim and Escape still work).
  const drag = React.useRef<{ pointerId: number; startY: number; offset: number } | null>(null);
  const resetDrag = () => {
    const drawer = drawerRef.current;
    drag.current = null;
    if (!drawer) return;
    drawer.classList.remove("is-dragging");
    drawer.style.transform = "";
  };
  const handleProps =
    placement === "bottom" && onClose != null
      ? {
          onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
            if (event.button !== 0) return;
            drag.current = { pointerId: event.pointerId, startY: event.clientY, offset: 0 };
            event.currentTarget.setPointerCapture?.(event.pointerId);
            drawerRef.current?.classList.add("is-dragging");
          },
          onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
            const current = drag.current;
            const drawer = drawerRef.current;
            if (!current || current.pointerId !== event.pointerId || !drawer) return;
            current.offset = Math.max(0, event.clientY - current.startY);
            drawer.style.transform = `translateY(${current.offset}px)`;
          },
          onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => {
            const current = drag.current;
            if (!current || current.pointerId !== event.pointerId) return;
            const close = current.offset >= DRAWER_DRAG_CLOSE_DISTANCE;
            resetDrag();
            if (close) onCloseRef.current?.();
          },
          onPointerCancel: resetDrag,
        }
      : undefined;

  React.useEffect(() => {
    if (!open || (shouldPortal && !portalReady)) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const unlock = fixed ? lockBodyScroll() : () => {};
    const frame = requestAnimationFrame(() => focusFirst(drawer, initialFocusRef?.current));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onCloseRef.current != null) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      trapTabKey(event, drawer);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      unlock();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open, fixed, shouldPortal, portalReady, initialFocusRef]);

  const content = (
    <div
      className={cx("mk-drawer-root", open && "open", fixed && "fixed", className)}
      aria-hidden={!open || undefined}
      {...rest}
    >
      <div className="mk-drawer-scrim" aria-hidden="true" onMouseDown={() => onCloseRef.current?.()} />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel == null && title != null ? titleId : undefined}
        tabIndex={-1}
        className={cx("mk-drawer", placement === "bottom" && "is-bottom")}
      >
        {placement === "bottom" && <div className="mk-drawer-handle" aria-hidden="true" {...handleProps} />}
        <div className="mk-drawer-head">
          <div id={titleId} className="mk-drawer-title">
            {title}
          </div>
          {onClose != null && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              icon={<CrossGlyph size={11} />}
              aria-label={closeLabel}
              onClick={onClose}
            />
          )}
        </div>
        <div className="mk-drawer-body">{children}</div>
        {footer != null && <div className="mk-drawer-foot">{footer}</div>}
      </div>
    </div>
  );

  if (!shouldPortal) return content;
  return portalReady ? createPortal(content, document.body) : null;
});
