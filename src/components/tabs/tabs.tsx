import * as React from "react";
import { cx } from "../../internal/cx";
import {
  canActivateTab,
  createTabsInteractionController,
  getTabRelationshipIds,
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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  }, [active, placeInk]);

  React.useEffect(() => {
    const reposition = () =>
      placeInk(activeRef.current == null ? null : (btnRefs.current.get(activeRef.current) ?? null), true);
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
  const activeRelationship = activeItem
    ? getTabRelationshipIds(baseId, activeIndex, activeItem)
    : undefined;
  const tabList = (
    <div
      ref={rootRef}
      id={baseId}
      role="tablist"
      aria-orientation="horizontal"
      className={cx("mk-tabs", className)}
      {...rest}
    >
      {items.map((item, index) => {
        const selected = item.value === active;
        const relationship = getTabRelationshipIds(baseId, index, item);
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

  if (activeItem?.panel === undefined) return tabList;
  return (
    <div className="mk-tabs-shell">
      {tabList}
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
