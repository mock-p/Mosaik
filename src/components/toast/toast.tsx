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

interface ToastTimer {
  timeout?: ReturnType<typeof setTimeout>;
  remaining: number;
  startedAt: number;
}

const EXIT_MS = 450;

/**
 * Manages a stack of toasts: push, pause/resume auto-dismiss,
 * cap at `max` visible, and remove after the exit animation.
 */
export function useToasts({ duration = 4200, max = 4 } = {}) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);
  const toastsRef = React.useRef(toasts);
  const autoTimers = React.useRef(new Map<number, ToastTimer>());
  const exitTimers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>());
  toastsRef.current = toasts;

  const clearAutoTimer = React.useCallback((id: number) => {
    const timer = autoTimers.current.get(id);
    if (timer?.timeout != null) clearTimeout(timer.timeout);
    autoTimers.current.delete(id);
  }, []);

  const dismiss = React.useCallback(
    (id: number) => {
      clearAutoTimer(id);
      setToasts((items) => {
        const next = items.map((item) =>
          item.id === id && !item.leaving ? { ...item, leaving: true } : item,
        );
        toastsRef.current = next;
        return next;
      });

      if (exitTimers.current.has(id)) return;
      const timeout = setTimeout(() => {
        exitTimers.current.delete(id);
        setToasts((items) => {
          const next = items.filter((item) => item.id !== id);
          toastsRef.current = next;
          return next;
        });
      }, EXIT_MS);
      exitTimers.current.set(id, timeout);
    },
    [clearAutoTimer],
  );

  const schedule = React.useCallback(
    (id: number, delay: number) => {
      if (delay <= 0) return;
      clearAutoTimer(id);
      const timer: ToastTimer = {
        remaining: delay,
        startedAt: Date.now(),
      };
      timer.timeout = setTimeout(() => dismiss(id), delay);
      autoTimers.current.set(id, timer);
    },
    [clearAutoTimer, dismiss],
  );

  const pause = React.useCallback((id: number) => {
    const timer = autoTimers.current.get(id);
    if (timer == null || timer.timeout == null) return;
    clearTimeout(timer.timeout);
    timer.timeout = undefined;
    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
  }, []);

  const resume = React.useCallback(
    (id: number) => {
      const timer = autoTimers.current.get(id);
      if (timer == null || timer.timeout != null) return;
      if (timer.remaining <= 0) dismiss(id);
      else schedule(id, timer.remaining);
    },
    [dismiss, schedule],
  );

  const push = React.useCallback(
    (kind: ToastKind, options: ToastOptions) => {
      const id = ++idRef.current;
      const visible = toastsRef.current.filter((item) => !item.leaving);
      if (visible.length >= Math.max(1, max)) dismiss(visible[0].id);
      setToasts((items) => {
        const next = [...items, { id, kind, leaving: false, ...options }];
        toastsRef.current = next;
        return next;
      });
      schedule(id, duration);
      return id;
    },
    [dismiss, duration, max, schedule],
  );

  React.useEffect(
    () => () => {
      autoTimers.current.forEach((timer) => {
        if (timer.timeout != null) clearTimeout(timer.timeout);
      });
      exitTimers.current.forEach(clearTimeout);
      autoTimers.current.clear();
      exitTimers.current.clear();
    },
    [],
  );

  return { toasts, push, dismiss, pause, resume };
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
  /** Called once when hover or focus pauses auto-dismiss. */
  onPause?: () => void;
  /** Called once when both hover and focus leave. */
  onResume?: () => void;
  closeLabel?: string;
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
    onPause,
    onResume,
    closeLabel = "Dismiss notification",
    duration = 4200,
    className,
    children,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...rest
  },
  forwardedRef,
) {
  const [entered, setEntered] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const pauseReasons = React.useRef(new Set<"hover" | "focus">());

  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef != null) forwardedRef.current = node;
    },
    [forwardedRef],
  );

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

  const addPauseReason = (reason: "hover" | "focus") => {
    if (pauseReasons.current.has(reason)) return;
    const wasRunning = pauseReasons.current.size === 0;
    pauseReasons.current.add(reason);
    setPaused(true);
    if (wasRunning) onPause?.();
  };

  const removePauseReason = (reason: "hover" | "focus") => {
    if (!pauseReasons.current.delete(reason)) return;
    if (pauseReasons.current.size > 0) return;
    setPaused(false);
    onResume?.();
  };

  const handleDismiss = (event: React.MouseEvent<HTMLButtonElement>) => {
    const shouldRestoreFocus = document.activeElement === event.currentTarget;
    const zone = rootRef.current?.closest<HTMLElement>(".mk-toast-zone");
    const candidates = zone == null
      ? []
      : Array.from(zone.querySelectorAll<HTMLButtonElement>(".mk-toast-x:not(:disabled)"));
    const currentIndex = candidates.indexOf(event.currentTarget);
    const nextFocus = candidates[currentIndex + 1] ?? candidates[currentIndex - 1] ?? zone;
    onDismiss?.();
    if (shouldRestoreFocus && nextFocus != null) {
      requestAnimationFrame(() => {
        if (nextFocus.isConnected) nextFocus.focus();
      });
    }
  };

  return (
    <div
      ref={setRef}
      aria-atomic="true"
      data-paused={paused || undefined}
      className={cx(
        "mk-toast",
        `is-${kind}`,
        `anim-${animation}`,
        entered && "in",
        leaving && "out",
        className,
      )}
      onMouseEnter={(event) => {
        addPauseReason("hover");
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        removePauseReason("hover");
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) addPauseReason("focus");
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) removePauseReason("focus");
        onBlur?.(event);
      }}
      {...rest}
    >
      <span className="mk-toast-glyph" aria-hidden="true">{GLYPH[kind]}</span>
      <span className="mk-toast-body">
        {title != null && <span className="mk-toast-title">{title}</span>}
        {children != null && <span className="mk-toast-text">{children}</span>}
      </span>
      {onDismiss != null && (
        <button className="mk-toast-x" type="button" aria-label={closeLabel} onClick={handleDismiss}>
          <CrossGlyph />
        </button>
      )}
      {duration > 0 && (
        <span
          className="mk-toast-progress"
          aria-hidden="true"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
});

export interface ToastZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Pin to the viewport's top-right corner instead of the nearest positioned parent. */
  fixed?: boolean;
  /** Announcement urgency for newly added notifications. @default "polite" */
  live?: "polite" | "assertive" | "off";
  label?: string;
}

/** Stacking container and single live region for toasts. */
export function ToastZone({
  fixed = false,
  live = "polite",
  label = "Notifications",
  className,
  children,
  role = "region",
  ...rest
}: ToastZoneProps) {
  return (
    <div
      role={role}
      aria-label={label}
      aria-live={live}
      aria-relevant="additions text"
      aria-atomic="false"
      tabIndex={-1}
      className={cx("mk-toast-zone", fixed && "fixed", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
