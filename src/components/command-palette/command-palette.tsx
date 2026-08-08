import * as React from "react";
import { createPortal } from "react-dom";
import { cx } from "../../internal/cx";
import { focusFirst, lockBodyScroll, trapTabKey } from "../../internal/focus";
import { Kbd } from "../kbd";

export interface CommandItem {
  id?: string;
  label: string;
  icon?: React.ReactNode;
  /** Extra search terms that are not displayed. */
  keywords?: string[];
  /** Shortcut chip, e.g. "⌘R". */
  kbd?: React.ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface CommandGroup {
  label: React.ReactNode;
  items: CommandItem[];
}

export interface CommandPaletteProps extends React.HTMLAttributes<HTMLDivElement> {
  groups: CommandGroup[];
  open?: boolean;
  /** Enables focus trapping, focus restoration, and scroll locking. */
  modal?: boolean;
  /** Renders a modal palette in `document.body`. Defaults to `modal`. */
  portal?: boolean;
  /** Focuses the search input on open. Defaults to `modal`. */
  autoFocus?: boolean;
  /** @default "Que voulez-vous faire ?" */
  placeholder?: string;
  /** @default "Aucune commande trouvée." */
  emptyMessage?: React.ReactNode;
  dialogLabel?: string;
  searchLabel?: string;
  /** Replaces the default ↑↓ / ↵ footer hints. Null hides the footer. */
  footer?: React.ReactNode | null;
  navigationLabel?: React.ReactNode;
  selectionLabel?: React.ReactNode;
  /** Calls `onClose` after a command runs. @default false */
  closeOnSelect?: boolean;
  /** Called on Escape and, when enabled, after selection. */
  onClose?: () => void;
}

interface FilteredItem {
  item: CommandItem;
  key: string;
  optionId: string;
}

interface FilteredGroup {
  label: React.ReactNode;
  key: string;
  labelId: string;
  items: FilteredItem[];
}

/**
 * Command palette (⌘K) with live filtering and listbox keyboard navigation.
 * Use `modal` for an overlay; embedded mode remains available for inline layouts.
 */
export function CommandPalette({
  groups,
  open = true,
  modal = false,
  portal,
  autoFocus,
  placeholder = "Que voulez-vous faire ?",
  emptyMessage = "Aucune commande trouvée.",
  dialogLabel = "Command palette",
  searchLabel = "Search commands",
  footer,
  navigationLabel = "naviguer",
  selectionLabel = "exécuter",
  closeOnSelect = false,
  onClose,
  className,
  onKeyDown: externalOnKeyDown,
  role,
  "aria-label": ariaLabel,
  ...rest
}: CommandPaletteProps) {
  const generatedId = React.useId();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [portalReady, setPortalReady] = React.useState(false);
  const shouldPortal = portal ?? modal;
  const shouldAutoFocus = autoFocus ?? modal;
  const contentReady = !modal || !shouldPortal || portalReady;
  const listId = `${generatedId}-list`;

  React.useEffect(() => setPortalReady(true), []);

  const filtered = React.useMemo<FilteredGroup[]>(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return groups
      .map((group, groupIndex) => {
        const groupKey = `${generatedId}-group-${groupIndex}`;
        const items = group.items
          .map((item, itemIndex) => ({
            item,
            key: `${groupKey}-item-${item.id ?? "anonymous"}-${itemIndex}`,
            optionId: `${generatedId}-option-${groupIndex}-${item.id ?? "anonymous"}-${itemIndex}`,
          }))
          .filter(({ item }) => {
            if (!normalizedQuery) return true;
            const searchable = [item.label, ...(item.keywords ?? [])].join(" ").toLocaleLowerCase();
            return searchable.includes(normalizedQuery);
          });
        return {
          label: group.label,
          key: groupKey,
          labelId: `${groupKey}-label`,
          items,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [generatedId, groups, query]);

  const options = React.useMemo(
    () => filtered.flatMap((group) => group.items).filter(({ item }) => !item.disabled),
    [filtered],
  );
  const visibleOptionCount = React.useMemo(
    () => filtered.reduce((total, group) => total + group.items.length, 0),
    [filtered],
  );
  const activeOption = options[activeIdx];

  React.useEffect(() => {
    setActiveIdx((index) => Math.min(index, Math.max(options.length - 1, 0)));
  }, [options.length]);

  React.useEffect(() => {
    if (!open || rootRef.current == null) return;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const root = rootRef.current;
    const frame = shouldAutoFocus
      ? requestAnimationFrame(() => focusFirst(root, inputRef.current))
      : 0;
    const releaseScroll = modal ? lockBodyScroll() : undefined;
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (modal) trapTabKey(event, root);
    };
    if (modal) document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      releaseScroll?.();
      document.removeEventListener("keydown", handleDocumentKeyDown);
      if (modal && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [contentReady, modal, open, shouldAutoFocus]);

  React.useEffect(() => {
    if (activeOption == null) return;
    document.getElementById(activeOption.optionId)?.scrollIntoView({ block: "nearest" });
  }, [activeOption]);

  const select = (entry: FilteredItem | undefined) => {
    if (entry == null || entry.item.disabled) return;
    entry.item.onSelect?.();
    if (closeOnSelect) onClose?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (options.length > 0) {
        const delta = event.key === "ArrowDown" ? 1 : -1;
        setActiveIdx((index) => (index + delta + options.length) % options.length);
      }
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIdx(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIdx(Math.max(options.length - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(activeOption);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose?.();
    }
    externalOnKeyDown?.(event);
  };

  if (!open || !contentReady) return null;

  const palette = (
    <div
      ref={rootRef}
      role={role ?? "dialog"}
      aria-label={ariaLabel ?? dialogLabel}
      aria-modal={modal || undefined}
      tabIndex={-1}
      className={cx("mk-cmdk", modal && "is-modal", className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <div className="mk-cmdk-search">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.4 9.4 L12.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeOption?.optionId}
          placeholder={placeholder}
          aria-label={searchLabel}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIdx(0);
          }}
        />
        <span aria-hidden="true"><Kbd>esc</Kbd></span>
      </div>
      <div id={listId} className="mk-cmdk-list" role="listbox" aria-label={dialogLabel}>
        {filtered.map((group) => (
          <div key={group.key} role="group" aria-labelledby={group.labelId}>
            <div id={group.labelId} className="mk-cmdk-group">{group.label}</div>
            {group.items.map((entry) => {
              const optionIndex = options.findIndex((option) => option.key === entry.key);
              const isActive = optionIndex === activeIdx && !entry.item.disabled;
              return (
                <div
                  key={entry.key}
                  id={entry.optionId}
                  role="option"
                  aria-selected={isActive}
                  aria-disabled={entry.item.disabled || undefined}
                  className={cx(
                    "mk-cmdk-item",
                    isActive && "is-active",
                    entry.item.disabled && "is-disabled",
                  )}
                  onMouseMove={() => {
                    if (optionIndex >= 0) setActiveIdx(optionIndex);
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => select(entry)}
                >
                  {entry.item.icon != null && <span aria-hidden="true">{entry.item.icon}</span>}
                  <span className="mk-cmdk-item-label">{entry.item.label}</span>
                  {entry.item.kbd != null && <span aria-hidden="true"><Kbd>{entry.item.kbd}</Kbd></span>}
                </div>
              );
            })}
          </div>
        ))}
        {visibleOptionCount === 0 && (
          <div className="mk-cmdk-empty" role="status">{emptyMessage}</div>
        )}
      </div>
      {footer !== null && (
        <div className="mk-cmdk-foot" aria-hidden={footer == null ? "true" : undefined}>
          {footer ?? (
            <>
              <span className="hint">
                <Kbd>↑↓</Kbd> {navigationLabel}
              </span>
              <span className="hint">
                <Kbd>↵</Kbd> {selectionLabel}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );

  const content = modal ? <div className="mk-cmdk-overlay">{palette}</div> : palette;
  return modal && shouldPortal ? createPortal(content, document.body) : content;
}
