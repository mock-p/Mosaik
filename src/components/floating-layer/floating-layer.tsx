import * as React from "react";
import { cx } from "../../internal/cx";

export type FloatPlacement = "top" | "bottom" | "left" | "right";

export interface FloatingLayerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Side of the anchor the layer sits on — the pointer aims back at it. @default "top" */
  placement?: FloatPlacement;
  /** Display-font heading (tier 2+). */
  title?: React.ReactNode;
  /** Optional action row (tier 3) — use `FloatingButton`. */
  actions?: React.ReactNode;
  /**
   * Compact nowrap tooltip styling.
   * Defaults to true when there is no title and no actions.
   */
  tip?: boolean;
  /** Hide the Mosaik triangle pointer. @default true */
  pointer?: boolean;
}

/**
 * Unified floating layer (inverse surface): text only → tooltip,
 * title + text → rich tooltip, + actions → popover.
 * Purely presentational — anchor and position it yourself.
 */
export const FloatingLayer = React.forwardRef<HTMLDivElement, FloatingLayerProps>(
  function FloatingLayer(
    { placement = "top", title, actions, tip, pointer = true, className, children, ...rest },
    ref,
  ) {
    const isTip = tip ?? (title == null && actions == null);
    return (
      <div
        ref={ref}
        role="tooltip"
        className={cx("mk-float", isTip && "tip", `place-${placement}`, className)}
        {...rest}
      >
        {title != null && <div className="mk-float-title">{title}</div>}
        {isTip ? children : children != null && <p className="mk-float-text">{children}</p>}
        {actions != null && <div className="mk-float-acts">{actions}</div>}
        {pointer && <span className="mk-float-ptr" />}
      </div>
    );
  },
);

export interface FloatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** @default "ghost" */
  variant?: "primary" | "ghost";
}

/** Action button adapted to the inverse floating surface. */
export const FloatingButton = React.forwardRef<HTMLButtonElement, FloatingButtonProps>(
  function FloatingButton({ variant = "ghost", className, type = "button", ...rest }, ref) {
    return (
      <button ref={ref} type={type} className={cx("mk-float-btn", variant, className)} {...rest} />
    );
  },
);
