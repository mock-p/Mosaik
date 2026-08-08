import * as React from "react";
import { createPortal } from "react-dom";
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
  /** Show the Mosaik triangle pointer. @default true */
  pointer?: boolean;
  /**
   * Semantic role. Auto uses `tooltip` only for non-interactive content and no role for popovers.
   * This component remains presentational: the consumer owns trigger, visibility and positioning.
   */
  semanticRole?: "auto" | "tooltip" | "dialog" | "status" | "none";
}

/**
 * Unified floating layer (inverse surface): text only → tooltip,
 * title + text → rich tooltip, + actions → popover.
 * Purely presentational — anchor and position it yourself.
 */
export const FloatingLayer = React.forwardRef<HTMLDivElement, FloatingLayerProps>(
  function FloatingLayer(
    {
      placement = "top",
      title,
      actions,
      tip,
      pointer = true,
      semanticRole = "auto",
      className,
      children,
      role,
      ...rest
    },
    ref,
  ) {
    const isTip = tip ?? (title == null && actions == null);
    const resolvedRole =
      role ??
      (semanticRole === "auto"
        ? actions == null
          ? "tooltip"
          : undefined
        : semanticRole === "none"
          ? undefined
          : semanticRole);
    return (
      <div
        ref={ref}
        role={resolvedRole}
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

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  "aria-describedby"?: string;
}

export interface TooltipProps
  extends Omit<
    FloatingLayerProps,
    | "actions"
    | "children"
    | "content"
    | "placement"
    | "role"
    | "semanticRole"
    | "tip"
    | "title"
  > {
  content: React.ReactNode;
  children: React.ReactElement<TooltipTriggerProps>;
  placement?: FloatPlacement;
  /** Hover delay in milliseconds. Keyboard focus opens immediately. @default 300 */
  delay?: number;
  disabled?: boolean;
  /** Renders the layer in `document.body`. @default true */
  portal?: boolean;
  wrapperClassName?: string;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Non-interactive tooltip for one focusable trigger.
 * Opens on hover/focus, closes on leave/blur/Escape, and wires `aria-describedby`.
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  delay = 300,
  disabled = false,
  portal = true,
  wrapperClassName,
  onOpenChange,
  className,
  pointer = true,
  id,
  style,
  ...rest
}: TooltipProps) {
  const generatedId = React.useId();
  const tooltipId = id ?? `${generatedId}-tooltip`;
  const anchorRef = React.useRef<HTMLSpanElement | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const reasonsRef = React.useRef(new Set<"focus" | "hover">());
  const openRef = React.useRef(false);
  const [open, setOpen] = React.useState(false);
  const [portalReady, setPortalReady] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => setPortalReady(true), []);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current != null) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const setVisibility = React.useCallback(
    (next: boolean) => {
      if (openRef.current === next) return;
      openRef.current = next;
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const updatePosition = React.useCallback(() => {
    const anchor = anchorRef.current;
    if (anchor == null) return;
    const rect = anchor.getBoundingClientRect();
    const gap = 8;
    if (placement === "top") {
      setPosition({ top: rect.top - gap, left: rect.left + rect.width / 2 });
    } else if (placement === "bottom") {
      setPosition({ top: rect.bottom + gap, left: rect.left + rect.width / 2 });
    } else if (placement === "left") {
      setPosition({ top: rect.top + rect.height / 2, left: rect.left - gap });
    } else {
      setPosition({ top: rect.top + rect.height / 2, left: rect.right + gap });
    }
  }, [placement]);

  const show = React.useCallback(
    (reason: "focus" | "hover") => {
      if (disabled || content == null) return;
      reasonsRef.current.add(reason);
      clearTimer();
      updatePosition();
      if (reason === "focus" || delay <= 0) setVisibility(true);
      else timerRef.current = setTimeout(() => setVisibility(true), delay);
    },
    [clearTimer, content, delay, disabled, setVisibility, updatePosition],
  );

  const hide = React.useCallback(
    (reason: "focus" | "hover") => {
      reasonsRef.current.delete(reason);
      if (reasonsRef.current.size > 0) return;
      clearTimer();
      setVisibility(false);
    },
    [clearTimer, setVisibility],
  );

  React.useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!disabled && content != null) return;
    reasonsRef.current.clear();
    clearTimer();
    setVisibility(false);
  }, [clearTimer, content, disabled, setVisibility]);

  React.useEffect(() => clearTimer, [clearTimer]);

  const childProps = children.props;
  const describedBy = [childProps["aria-describedby"], open ? tooltipId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;
  const trigger = React.cloneElement(children, {
    "aria-describedby": describedBy,
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      show("focus");
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      hide("focus");
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      childProps.onKeyDown?.(event);
      if (event.key === "Escape" && openRef.current) {
        event.preventDefault();
        reasonsRef.current.clear();
        clearTimer();
        setVisibility(false);
      }
    },
  });

  const layer = open ? (
    <FloatingLayer
      id={tooltipId}
      placement={placement}
      pointer={pointer}
      semanticRole="tooltip"
      tip
      className={cx("mk-tooltip-layer", className)}
      style={{ ...style, top: position.top, left: position.left }}
      {...rest}
    >
      {content}
    </FloatingLayer>
  ) : null;

  return (
    <span
      ref={anchorRef}
      className={cx("mk-tooltip-anchor", wrapperClassName)}
      onMouseEnter={() => show("hover")}
      onMouseLeave={() => hide("hover")}
    >
      {trigger}
      {!portal && layer}
      {portal && portalReady && layer != null ? createPortal(layer, document.body) : null}
    </span>
  );
}
