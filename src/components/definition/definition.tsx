import * as React from "react";
import { createPortal } from "react-dom";
import { cx } from "../../internal/cx";
import { getFocusableElements } from "../../internal/focus";
import { FloatingLayer, type FloatPlacement } from "../floating-layer";
import {
  addDefinitionReason,
  computeDefinitionPosition,
  definitionTriggerAria,
  isDefinitionEventInside,
  isDefinitionOpen,
  isHoverPointer,
  removeDefinitionReason,
  toggleDefinitionReasons,
  type DefinitionReason,
  type DefinitionToggleSource,
} from "./definition-state.mjs";

export interface DefinitionProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "title" | "content" | "children"> {
  /** The term being defined — rendered as the popover heading. */
  title?: React.ReactNode;
  /** Trigger content: the term as it reads in the sentence. */
  children: React.ReactNode;
  /** The definition itself (one or two sentences). */
  content: React.ReactNode;
  /** Interactive row under the definition, e.g. a "Learn more" link. */
  action?: React.ReactNode;
  /** Preferred side; flips when the viewport lacks room. @default "top" */
  placement?: FloatPlacement;
  /** Mouse hover open delay in ms. Keyboard focus and taps open immediately. @default 300 */
  delay?: number;
  /**
   * Grace period in ms before a hover-opened popover closes once the pointer leaves,
   * long enough to travel from the term into the popover. @default 200
   */
  closeDelay?: number;
  /** Render the trigger as plain text: no underline, no popover. */
  disabled?: boolean;
  /** Renders the popover in `document.body`. @default true */
  portal?: boolean;
  /** Extra class on the popover layer. */
  layerClassName?: string;
  onOpenChange?: (open: boolean) => void;
}

const EMPTY: DefinitionReason[] = [];

/**
 * Inline glossary term: dotted-underlined trigger that opens an interactive, non-modal
 * definition popover on hover (delayed, with a grace period), keyboard focus, or tap/click.
 * Closes on Escape, outside press, focus leaving trigger + popover, or pointer leave.
 */
export function Definition({
  title,
  children,
  content,
  action,
  placement = "top",
  delay = 300,
  closeDelay = 200,
  disabled = false,
  portal = true,
  layerClassName,
  onOpenChange,
  className,
  id,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: DefinitionProps) {
  const generatedId = React.useId();
  const baseId = id ?? `${generatedId}-term`;
  const layerId = `${baseId}-definition`;
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

  const triggerRef = React.useRef<HTMLSpanElement | null>(null);
  const layerRef = React.useRef<HTMLDivElement | null>(null);
  const reasonsRef = React.useRef<DefinitionReason[]>(EMPTY);
  const openTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerDownRef = React.useRef(false);
  /** A press inside the popover: Safari blurs without a related target before the click lands. */
  const layerPressRef = React.useRef(false);
  /** Focus handed back to the trigger after Escape must not reopen the popover. */
  const returningFocusRef = React.useRef(false);
  const lastPointerTypeRef = React.useRef<string | null>(null);
  const onOpenChangeRef = React.useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const [open, setOpen] = React.useState(false);
  const [portalReady, setPortalReady] = React.useState(false);
  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
    placement: FloatPlacement;
    pointerOffset: number;
    measured: boolean;
  }>({ top: 0, left: 0, placement, pointerOffset: 0, measured: false });

  React.useEffect(() => setPortalReady(true), []);

  const clearTimers = React.useCallback(() => {
    if (openTimerRef.current != null) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current != null) clearTimeout(closeTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
  }, []);

  const commit = React.useCallback((next: DefinitionReason[]) => {
    const wasOpen = isDefinitionOpen(reasonsRef.current);
    reasonsRef.current = next;
    const isOpen = isDefinitionOpen(next);
    if (wasOpen === isOpen) return;
    setOpen(isOpen);
    if (!isOpen) setPosition((current) => ({ ...current, measured: false }));
    onOpenChangeRef.current?.(isOpen);
  }, []);

  const closeAll = React.useCallback(() => {
    clearTimers();
    commit(EMPTY);
  }, [clearTimers, commit]);

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    const layer = layerRef.current;
    if (trigger == null || layer == null) return;
    const anchor = trigger.getBoundingClientRect();
    const next = computeDefinitionPosition({
      anchor,
      layer: { width: layer.offsetWidth, height: layer.offsetHeight },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      placement,
    });
    setPosition({ ...next, measured: true });
  }, [placement]);

  // Hover: delayed open, grace-period close (shared by trigger and popover).
  const hoverIn = React.useCallback(() => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (reasonsRef.current.includes("hover") || openTimerRef.current != null) return;
    if (delay <= 0) {
      commit(addDefinitionReason(reasonsRef.current, "hover"));
      return;
    }
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null;
      commit(addDefinitionReason(reasonsRef.current, "hover"));
    }, delay);
  }, [commit, delay]);

  const hoverOut = React.useCallback(() => {
    if (openTimerRef.current != null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (!reasonsRef.current.includes("hover")) return;
    if (closeTimerRef.current != null) clearTimeout(closeTimerRef.current);
    const release = () => {
      closeTimerRef.current = null;
      commit(removeDefinitionReason(reasonsRef.current, "hover"));
    };
    if (closeDelay <= 0) release();
    else closeTimerRef.current = setTimeout(release, closeDelay);
  }, [closeDelay, commit]);

  const toggle = React.useCallback(
    (source: DefinitionToggleSource) => {
      if (openTimerRef.current != null) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
      const next = toggleDefinitionReasons(reasonsRef.current, source);
      if (next.length === 0) clearTimers();
      commit(next);
    },
    [clearTimers, commit],
  );

  // Measure once mounted, then follow scroll / resize while open.
  React.useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, portalReady, updatePosition]);

  // Outside press closes.
  React.useEffect(() => {
    if (!open) return;
    const onPointer = (event: Event) => {
      if (!layerRef.current?.contains(event.target as Node)) layerPressRef.current = false;
      if (isDefinitionEventInside(triggerRef.current, layerRef.current, event.target as Node)) return;
      closeAll();
    };
    document.addEventListener("pointerdown", onPointer, true);
    return () => document.removeEventListener("pointerdown", onPointer, true);
  }, [closeAll, open]);

  React.useEffect(() => {
    if (disabled) closeAll();
  }, [closeAll, disabled]);

  React.useEffect(() => clearTimers, [clearTimers]);

  const focusTrigger = (quiet = false) => {
    returningFocusRef.current = quiet;
    triggerRef.current?.focus({ preventScroll: true });
    returningFocusRef.current = false;
  };

  const focusAfterTrigger = () => {
    const trigger = triggerRef.current;
    if (trigger == null) return;
    const all = getFocusableElements(document.body).filter(
      (element) => !layerRef.current?.contains(element),
    );
    const index = all.indexOf(trigger);
    const next = index >= 0 ? all[index + 1] : undefined;
    (next ?? trigger).focus({ preventScroll: true });
  };

  const focusOutside = (related: EventTarget | null) =>
    !layerPressRef.current &&
    !isDefinitionEventInside(triggerRef.current, layerRef.current, related as Node | null);

  if (disabled) return <>{children}</>;

  const aria = definitionTriggerAria(open, open && portalReady, layerId, descriptionId, ariaDescribedBy);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle("keyboard");
    } else if (event.key === "Escape" && isDefinitionOpen(reasonsRef.current)) {
      event.preventDefault();
      event.stopPropagation();
      closeAll();
    } else if (event.key === "Tab" && !event.shiftKey && isDefinitionOpen(reasonsRef.current)) {
      const layer = layerRef.current;
      const focusable = layer ? getFocusableElements(layer) : [];
      if (focusable.length > 0) {
        event.preventDefault();
        focusable[0].focus();
      }
    }
  };

  const handleLayerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      closeAll();
      focusTrigger(true);
      return;
    }
    if (event.key !== "Tab") return;
    const layer = layerRef.current;
    if (layer == null) return;
    const focusable = getFocusableElements(layer);
    const active = document.activeElement;
    if (event.shiftKey && (focusable.length === 0 || active === focusable[0] || active === layer)) {
      event.preventDefault();
      focusTrigger();
    } else if (!event.shiftKey && (focusable.length === 0 || active === focusable[focusable.length - 1])) {
      event.preventDefault();
      closeAll();
      focusAfterTrigger();
    }
  };

  const layer = open ? (
    <FloatingLayer
      ref={layerRef}
      id={layerId}
      semanticRole="dialog"
      aria-modal={false}
      aria-labelledby={title != null ? titleId : undefined}
      aria-describedby={`${layerId}-text`}
      aria-label={title == null && typeof children === "string" ? children : undefined}
      placement={position.placement}
      title={title != null ? <span id={titleId}>{title}</span> : undefined}
      actions={action}
      tip={false}
      tabIndex={-1}
      className={cx("mk-definition-layer", layerClassName)}
      style={
        {
          top: position.top,
          left: position.left,
          visibility: position.measured ? undefined : "hidden",
          "--mk-def-ptr": `${position.pointerOffset}px`,
        } as React.CSSProperties
      }
      onPointerEnter={(event) => {
        if (isHoverPointer(event.pointerType)) hoverIn();
      }}
      onPointerLeave={(event) => {
        if (isHoverPointer(event.pointerType)) hoverOut();
      }}
      onPointerDown={() => {
        layerPressRef.current = true;
      }}
      onKeyDown={handleLayerKeyDown}
      onBlur={(event) => {
        if (focusOutside(event.relatedTarget)) closeAll();
      }}
      onClick={(event) => {
        // A portal still bubbles through the React tree: keep clicks local, then close
        // once an action (link / button) inside the popover has been activated.
        layerPressRef.current = false;
        event.stopPropagation();
        const target = event.target as HTMLElement | null;
        if (target?.closest?.("a[href],button")) closeAll();
      }}
    >
      <span id={`${layerId}-text`}>{content}</span>
    </FloatingLayer>
  ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        id={baseId}
        role="button"
        tabIndex={0}
        className={cx("mk-term", className)}
        aria-haspopup="dialog"
        aria-expanded={aria.expanded}
        aria-controls={aria.controls}
        aria-describedby={aria.describedBy}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          if (isHoverPointer(event.pointerType)) hoverIn();
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (isHoverPointer(event.pointerType)) hoverOut();
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          pointerDownRef.current = true;
          lastPointerTypeRef.current = event.pointerType || "mouse";
        }}
        onClick={(event) => {
          onClick?.(event);
          event.stopPropagation();
          const pointerType = lastPointerTypeRef.current;
          lastPointerTypeRef.current = null;
          pointerDownRef.current = false;
          toggle(
            pointerType === "touch" || pointerType === "pen"
              ? pointerType
              : pointerType == null && event.detail === 0
                ? "keyboard"
                : "mouse",
          );
        }}
        onKeyDown={handleTriggerKeyDown}
        onFocus={(event) => {
          onFocus?.(event);
          // Focus that comes from a press is handled by the click toggle.
          if (pointerDownRef.current || returningFocusRef.current) return;
          commit(addDefinitionReason(reasonsRef.current, "focus"));
        }}
        onBlur={(event) => {
          onBlur?.(event);
          pointerDownRef.current = false;
          if (focusOutside(event.relatedTarget)) {
            if (reasonsRef.current.includes("hover") && !reasonsRef.current.includes("click")) {
              commit(removeDefinitionReason(reasonsRef.current, "focus"));
            } else {
              closeAll();
            }
          }
        }}
        {...rest}
      >
        {children}
      </span>
      <span id={descriptionId} hidden>
        {content}
      </span>
      {!portal && layer}
      {portal && portalReady && layer != null ? createPortal(layer, document.body) : null}
    </>
  );
}
