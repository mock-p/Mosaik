import * as React from "react";
import { cx } from "../../internal/cx";

export interface SegmentItem {
  value: string;
  label: React.ReactNode;
}

export interface SegmentedControlProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: Array<SegmentItem | string>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const EASE_OVER = "cubic-bezier(.3, .9, .35, 1.08)";

interface SegmentButtonProps {
  item: SegmentItem;
  active: boolean;
  onSelect: (value: string) => void;
  register: (value: string, element: HTMLButtonElement | null) => void;
}

function SegmentButton({ item, active, onSelect, register }: SegmentButtonProps) {
  const buttonRef = React.useCallback(
    (element: HTMLButtonElement | null) => register(item.value, element),
    [item.value, register],
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={active}
      className={cx(active && "is-active")}
      onClick={() => onSelect(item.value)}
    >
      {item.label}
    </button>
  );
}

/**
 * Segmented control with the sliding pill: a single thumb travels
 * to the chosen segment with a slight overshoot and a subtle squash.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  className,
  ...rest
}: SegmentedControlProps) {
  const items = React.useMemo(
    () => options.map((o) => (typeof o === "string" ? { value: o, label: o } : o)),
    [options],
  );
  const [internal, setInternal] = React.useState(
    () => defaultValue ?? items[0]?.value,
  );
  const active = value ?? internal;

  const thumbRef = React.useRef<HTMLSpanElement>(null);
  const btnRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const geometryObserverRef = React.useRef<ResizeObserver | null>(null);
  const mounted = React.useRef(false);
  const squashTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  // read by the mount-only resize/fonts effect so it never re-runs on
  // selection change (a no-anim reposition there would kill the animation)
  const activeRef = React.useRef(active);
  activeRef.current = active;

  const placeThumb = React.useCallback((noAnim: boolean) => {
    const thumb = thumbRef.current;
    const btn = btnRefs.current.get(activeRef.current);
    if (!thumb || !btn) return;
    thumb.style.transition = noAnim
      ? "none"
      : `left .27s ${EASE_OVER}, width .27s ${EASE_OVER}`;
    thumb.style.left = `${btn.offsetLeft}px`;
    thumb.style.top = `${btn.offsetTop}px`;
    thumb.style.width = `${btn.offsetWidth}px`;
    thumb.style.height = `${btn.offsetHeight}px`;
  }, []);

  React.useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!mounted.current || reduced) {
      mounted.current = true;
      placeThumb(true);
      return;
    }
    placeThumb(false);
    const thumb = thumbRef.current;
    if (thumb) {
      thumb.classList.remove("moving");
      void thumb.offsetWidth; // restart animation
      thumb.classList.add("moving");
      clearTimeout(squashTimer.current);
      squashTimer.current = setTimeout(() => thumb.classList.remove("moving"), 300);
    }
    return () => clearTimeout(squashTimer.current);
  }, [active, placeThumb]);

  React.useEffect(() => {
    const reposition = () => placeThumb(true);
    const geometryObserver =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(reposition);
    geometryObserverRef.current = geometryObserver ?? null;
    btnRefs.current.forEach((button) => geometryObserver?.observe(button));
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(reposition, 80);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(reposition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      geometryObserverRef.current = null;
      geometryObserver?.disconnect();
    };
  }, [placeThumb]);

  const registerButton = React.useCallback(
    (itemValue: string, element: HTMLButtonElement | null) => {
      const previous = btnRefs.current.get(itemValue);
      if (previous && previous !== element) {
        geometryObserverRef.current?.unobserve(previous);
      }
      if (element) {
        btnRefs.current.set(itemValue, element);
        geometryObserverRef.current?.observe(element);
      } else {
        btnRefs.current.delete(itemValue);
      }
    },
    [],
  );

  const select = (next: string) => {
    if (next === active) return;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div role="group" className={cx("mk-seg", className)} {...rest}>
      <span ref={thumbRef} className="mk-seg-thumb" />
      {items.map((item) => (
        <SegmentButton
          key={item.value}
          item={item}
          active={item.value === active}
          onSelect={select}
          register={registerButton}
        />
      ))}
    </div>
  );
}
