import * as React from "react";
import { cx } from "../../internal/cx";
import { Triangle } from "../triangle";
import {
  canActivateTab,
  createTabsInteractionController,
  getTabRelationshipIds,
  getTabScrollLeft,
  getTabsOverflow,
  getTabsPageScrollLeft,
} from "./tabs-state.mjs";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  /** Counter chip next to the label. */
  count?: React.ReactNode;
  disabled?: boolean;
  /** Keep a disabled tab keyboard-focusable and expose it with `aria-disabled`. */
  focusableDisabled?: boolean;
  /** ID of contextual content describing this tab. */
  describedBy?: string;
  /** Explicit tab button ID, useful when a panel is rendered externally. */
  tabId?: string;
  /** Explicit ID of the panel controlled by this tab. */
  controls?: string;
  /** Optional panel rendered with the correct tabpanel relationship. */
  panel?: React.ReactNode;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Class applied to an optional rendered tab panel. */
  panelClassName?: string;
  /** Compact or standard tab dimensions. @default "md" */
  size?: "sm" | "md";
  /** Give every tab an equal share of the available row width. */
  equalWidth?: boolean;
  /**
   * Panels are rendered outside of Tabs with `getTabPanelProps(id, value)`: every tab gets the
   * matching value-based `id` and `aria-controls`. Requires an explicit `id`.
   */
  externalPanels?: boolean;
  /**
   * When the tabs overflow their row: pointer buttons at the faded edges that scroll the list.
   * The active tab is always scrolled into view. @default true
   */
  scrollButtons?: boolean;
  /** Class of the frame wrapping the tab list (edge fades and scroll buttons). */
  frameClassName?: string;
}

const EASE_OUT = "cubic-bezier(.2, .8, .3, 1)";
const EASE_IN = "cubic-bezier(.4, 0, .6, 1)";

/** Tabs with automatic keyboard activation and an optional associated panel. */
export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  panelClassName,
  size = "md",
  equalWidth = false,
  externalPanels = false,
  scrollButtons = true,
  frameClassName,
  id,
  className,
  ...rest
}: TabsProps) {
  const generatedId = React.useId();
  const baseId = id ?? generatedId;
  const firstEnabled = items.find((item) => !item.disabled)?.value;
  const [internal, setInternal] = React.useState(() => defaultValue ?? firstEnabled);
  const requestedActive = value ?? internal;
  const active = items.some((item) => item.value === requestedActive && !item.disabled)
    ? requestedActive
    : firstEnabled;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const inkRef = React.useRef<HTMLSpanElement>(null);
  const btnRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const mounted = React.useRef(false);
  const phaseTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeRef = React.useRef(active);
  activeRef.current = active;
  const [overflow, setOverflow] = React.useState({ start: false, end: false });

  const measureOverflow = React.useCallback(() => {
    const list = rootRef.current;
    if (!list) return;
    const next = getTabsOverflow(list);
    setOverflow((current) => (current.start === next.start && current.end === next.end ? current : next));
  }, []);

  const scrollListTo = React.useCallback((left: number, smooth: boolean) => {
    const list = rootRef.current;
    if (!list) return;
    if (typeof list.scrollTo === "function") list.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
    else list.scrollLeft = left;
  }, []);

  // Keep a tab (active or keyboard-focused) clear of the edge fades.
  const revealTab = React.useCallback((tab: HTMLElement | null | undefined, smooth: boolean) => {
    const list = rootRef.current;
    if (!list || !tab) return;
    const left = getTabScrollLeft(list, { left: tab.offsetLeft, width: tab.offsetWidth });
    if (left != null) scrollListTo(left, smooth);
  }, [scrollListTo]);

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
    const tab = active == null ? null : (btnRefs.current.get(active) ?? null);
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    revealTab(tab, mounted.current && !reduced);

    if (!mounted.current || reduced || !ink || !tab) {
      mounted.current = true;
      placeInk(tab, true);
      return;
    }

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
  }, [active, placeInk, revealTab]);

  React.useEffect(() => {
    const reposition = () =>
      placeInk(activeRef.current == null ? null : (btnRefs.current.get(activeRef.current) ?? null), true);
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        reposition();
        measureOverflow();
      }, 80);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => {
      reposition();
      measureOverflow();
    });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [placeInk, measureOverflow]);

  React.useLayoutEffect(() => {
    const list = rootRef.current;
    if (!list) return;
    measureOverflow();
    list.addEventListener("scroll", measureOverflow, { passive: true });
    // A tab that changes size (a count loaded after mount, a translated label) moves the others:
    // re-measure, re-place the ink and keep the active tab in view.
    const onResize = () => {
      const tab = activeRef.current == null ? null : (btnRefs.current.get(activeRef.current) ?? null);
      placeInk(tab, true);
      revealTab(tab, false);
      measureOverflow();
    };
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(onResize) : undefined;
    observer?.observe(list);
    btnRefs.current.forEach((button) => observer?.observe(button));
    return () => {
      list.removeEventListener("scroll", measureOverflow);
      observer?.disconnect();
    };
  }, [measureOverflow, placeInk, revealTab, items.length]);

  const scrollByPage = (direction: 1 | -1) => {
    const list = rootRef.current;
    if (!list) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    scrollListTo(getTabsPageScrollLeft(list, direction), !reduced);
  };

  const select = (next: string) => {
    const item = items.find((candidate) => candidate.value === next);
    if (!canActivateTab(item) || next === active) return;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const interaction = createTabsInteractionController(items, {
    select,
    focus: (next) => btnRefs.current.get(next)?.focus(),
  });

  const activeIndex = items.findIndex((item) => item.value === active);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : undefined;
  const relationshipOptions = { externalPanels };
  const activeRelationship = activeItem
    ? getTabRelationshipIds(baseId, activeIndex, activeItem, relationshipOptions)
    : undefined;
  const tabList = (
    <div
      ref={rootRef}
      id={baseId}
      role="tablist"
      aria-orientation="horizontal"
      className={cx("mk-tabs", `mk-tabs-${size}`, equalWidth && "is-equal", className)}
      {...rest}
    >
      {items.map((item, index) => {
        const selected = item.value === active;
        const relationship = getTabRelationshipIds(baseId, index, item, relationshipOptions);
        return (
          <button
            key={item.value}
            ref={(element) => {
              if (element) btnRefs.current.set(item.value, element);
              else btnRefs.current.delete(item.value);
            }}
            id={relationship.tabId}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={relationship.controls}
            aria-disabled={item.disabled && item.focusableDisabled ? true : undefined}
            aria-describedby={item.describedBy}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled && !item.focusableDisabled}
            className={cx("mk-tab", selected && "is-active")}
            onClick={() => interaction.activate(item.value)}
            onFocus={(event) => revealTab(event.currentTarget, true)}
            onKeyDown={(event) => {
              if (interaction.keyDown(item.value, event.key)) event.preventDefault();
            }}
          >
            {item.label}
            {item.count != null && <span className="count">{item.count}</span>}
          </button>
        );
      })}
      <span ref={inkRef} className="mk-tabs-ink" aria-hidden="true" />
    </div>
  );

  // Pointer-only affordance: keyboard users move with the arrow keys and the active tab is
  // always scrolled into view, so the buttons stay out of the tab order and the a11y tree.
  const framed = (
    <div
      className={cx(
        "mk-tabs-frame",
        overflow.start && "can-scroll-start",
        overflow.end && "can-scroll-end",
        frameClassName,
      )}
    >
      {tabList}
      {scrollButtons && overflow.start && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="mk-tabs-scroll is-start"
          onClick={() => scrollByPage(-1)}
        >
          <Triangle size={9} direction="left" />
        </button>
      )}
      {scrollButtons && overflow.end && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="mk-tabs-scroll is-end"
          onClick={() => scrollByPage(1)}
        >
          <Triangle size={9} direction="right" />
        </button>
      )}
    </div>
  );

  if (activeItem?.panel === undefined) return framed;
  return (
    <div className="mk-tabs-shell">
      {framed}
      <div
        id={activeRelationship?.panelId}
        role="tabpanel"
        aria-labelledby={activeRelationship?.labelledBy}
        tabIndex={0}
        className={cx("mk-tab-panel", panelClassName)}
      >
        {activeItem.panel}
      </div>
    </div>
  );
}
