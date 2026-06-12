import * as React from "react";
import { cx } from "../../internal/cx";
import { CheckGlyph, CrossGlyph, InfoGlyph, WarnGlyph } from "../../internal/glyphs";

export type ToastKind = "success" | "info" | "warning" | "error";
export type ToastAnimation = "slide" | "bounce" | "unfold";

export interface ToastOptions {
  title: React.ReactNode;
  text?: React.ReactNode;
}

export interface ToastItem extends ToastOptions {
  id: number;
  kind: ToastKind;
  leaving: boolean;
}

const EXIT_MS = 450;

/**
 * Manages a stack of toasts: push, auto-dismiss after `duration`,
 * cap at `max` visible, exit animation handled before removal.
 */
export function useToasts({ duration = 4200, max = 4 } = {}) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);
  const toastsRef = React.useRef(toasts);
  toastsRef.current = toasts;

  const dismiss = React.useCallback((id: number) => {
    setToasts((items) =>
      items.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );
    setTimeout(() => {
      setToasts((items) => items.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  const push = React.useCallback(
    (kind: ToastKind, options: ToastOptions) => {
      const id = ++idRef.current;
      const visible = toastsRef.current.filter((t) => !t.leaving);
      if (visible.length >= max) dismiss(visible[0].id);
      setToasts((items) => [...items, { id, kind, leaving: false, ...options }]);
      setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss, duration, max],
  );

  return { toasts, push, dismiss };
}

const GLYPH: Record<ToastKind, React.ReactNode> = {
  success: <CheckGlyph size={14} />,
  info: <InfoGlyph size={13} />,
  warning: <WarnGlyph size={14} />,
  error: <CrossGlyph size={11} strokeWidth={1.8} />,
};

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  kind?: ToastKind;
  title?: React.ReactNode;
  /** Entry animation. @default "slide" */
  animation?: ToastAnimation;
  /** Plays the exit animation. */
  leaving?: boolean;
  /** Shows the × button and is called on click. */
  onDismiss?: () => void;
  /** Auto-dismiss progress bar duration (ms); 0 hides the bar. @default 4200 */
  duration?: number;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    kind = "info",
    title,
    animation = "slide",
    leaving = false,
    onDismiss,
    duration = 4200,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [entered, setEntered] = React.useState(false);
  React.useEffect(() => {
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      className={cx(
        "mk-toast",
        `is-${kind}`,
        `anim-${animation}`,
        entered && "in",
        leaving && "out",
        className,
      )}
      {...rest}
    >
      <span className="mk-toast-glyph">{GLYPH[kind]}</span>
      <span className="mk-toast-body">
        {title != null && <span className="mk-toast-title">{title}</span>}
        {children != null && <span className="mk-toast-text">{children}</span>}
      </span>
      {onDismiss != null && (
        <button className="mk-toast-x" type="button" aria-label="Dismiss" onClick={onDismiss}>
          <CrossGlyph />
        </button>
      )}
      {duration > 0 && (
        <span className="mk-toast-progress" style={{ animationDuration: `${duration}ms` }} />
      )}
    </div>
  );
});

export interface ToastZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Pin to the viewport's top-right corner instead of the nearest positioned parent. */
  fixed?: boolean;
}

/** Stacking container for toasts — top-right, column flow. */
export function ToastZone({ fixed = false, className, children, ...rest }: ToastZoneProps) {
  return (
    <div aria-live="polite" className={cx("mk-toast-zone", fixed && "fixed", className)} {...rest}>
      {children}
    </div>
  );
}
