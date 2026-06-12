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
    };
  }, [placeThumb]);

  const select = (next: string) => {
    if (next === active) return;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div role="group" className={cx("mk-seg", className)} {...rest}>
      <span ref={thumbRef} className="mk-seg-thumb" />
      {items.map((item) => (
        <button
          key={item.value}
          ref={(el) => {
            if (el) btnRefs.current.set(item.value, el);
            else btnRefs.current.delete(item.value);
          }}
          type="button"
          aria-pressed={item.value === active}
          className={cx(item.value === active && "is-active")}
          onClick={() => select(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
