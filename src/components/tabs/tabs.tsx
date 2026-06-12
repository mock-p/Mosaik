import * as React from "react";
import { cx } from "../../internal/cx";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  /** Counter chip next to the label. */
  count?: React.ReactNode;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const EASE_OUT = "cubic-bezier(.2, .8, .3, 1)";
const EASE_IN = "cubic-bezier(.4, 0, .6, 1)";

/**
 * Tabs with the elastic sliding ink: on change the indicator first
 * stretches to cover both tabs (~160ms), then contracts onto the
 * destination (~220ms).
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  className,
  ...rest
}: TabsProps) {
  const [internal, setInternal] = React.useState(
    () => defaultValue ?? items[0]?.value,
  );
  const active = value ?? internal;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const inkRef = React.useRef<HTMLSpanElement>(null);
  const btnRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const mounted = React.useRef(false);
  const phaseTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  // read by the mount-only resize/fonts effect so it never re-runs on
  // selection change (a no-anim reposition there would kill the animation)
  const activeRef = React.useRef(active);
  activeRef.current = active;

  const placeInk = React.useCallback((tab: HTMLButtonElement | null, noAnim: boolean) => {
    const ink = inkRef.current;
    if (!ink) return;
    if (!tab) {
      ink.style.width = "0px";
      return;
    }
    if (noAnim) ink.style.transition = "none";
    ink.style.left = `${tab.offsetLeft}px`;
    ink.style.width = `${tab.offsetWidth}px`;
  }, []);

  React.useLayoutEffect(() => {
    const ink = inkRef.current;
    const tab = btnRefs.current.get(active) ?? null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!mounted.current || reduced || !ink || !tab) {
      mounted.current = true;
      placeInk(tab, true);
      return;
    }

    // phase 1: stretch over old + new, phase 2: contract onto the new tab
    const oldL = ink.offsetLeft;
    const oldR = oldL + ink.offsetWidth;
    const newL = tab.offsetLeft;
    const newR = newL + tab.offsetWidth;
    ink.style.transition = `left .16s ${EASE_IN}, width .16s ${EASE_IN}`;
    ink.style.left = `${Math.min(oldL, newL)}px`;
    ink.style.width = `${Math.max(oldR, newR) - Math.min(oldL, newL)}px`;
    clearTimeout(phaseTimer.current);
    phaseTimer.current = setTimeout(() => {
      ink.style.transition = `left .22s ${EASE_OUT}, width .22s ${EASE_OUT}`;
      ink.style.left = `${newL}px`;
      ink.style.width = `${newR - newL}px`;
    }, 170);
    return () => clearTimeout(phaseTimer.current);
  }, [active, placeInk]);

  React.useEffect(() => {
    const reposition = () =>
      placeInk(btnRefs.current.get(activeRef.current) ?? null, true);
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
  }, [placeInk]);

  const select = (next: string) => {
    if (next === active) return;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div ref={rootRef} role="tablist" className={cx("mk-tabs", className)} {...rest}>
      {items.map((item) => (
        <button
          key={item.value}
          ref={(el) => {
            if (el) btnRefs.current.set(item.value, el);
            else btnRefs.current.delete(item.value);
          }}
          type="button"
          role="tab"
          aria-selected={item.value === active}
          className={cx("mk-tab", item.value === active && "is-active")}
          onClick={() => select(item.value)}
        >
          {item.label}
          {item.count != null && <span className="count">{item.count}</span>}
        </button>
      ))}
      <span ref={inkRef} className="mk-tabs-ink" />
    </div>
  );
}
