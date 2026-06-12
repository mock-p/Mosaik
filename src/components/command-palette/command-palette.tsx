import * as React from "react";
import { cx } from "../../internal/cx";
import { Kbd } from "../kbd";

export interface CommandItem {
  label: string;
  icon?: React.ReactNode;
  /** Shortcut chip, e.g. "⌘R". */
  kbd?: React.ReactNode;
  onSelect?: () => void;
}

export interface CommandGroup {
  label: React.ReactNode;
  items: CommandItem[];
}

export interface CommandPaletteProps extends React.HTMLAttributes<HTMLDivElement> {
  groups: CommandGroup[];
  /** @default "Que voulez-vous faire ?" */
  placeholder?: string;
  /** @default "Aucune commande trouvée." */
  emptyMessage?: React.ReactNode;
  /** Replaces the default ↑↓ / ↵ footer hints. Null hides the footer. */
  footer?: React.ReactNode | null;
  /** Called on Escape. */
  onClose?: () => void;
}

/**
 * Command palette (⌘K) — live filter, arrow-key navigation,
 * Enter to run, grouped commands with shortcut chips.
 */
export function CommandPalette({
  groups,
  placeholder = "Que voulez-vous faire ?",
  emptyMessage = "Aucune commande trouvée.",
  footer,
  onClose,
  className,
  ...rest
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);

  const q = query.trim().toLowerCase();
  const filtered = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !q || item.label.toLowerCase().includes(q)),
    }))
    .filter((group) => group.items.length > 0);
  const flat = filtered.flatMap((group) => group.items);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIdx((i) => Math.min(Math.max(i + delta, 0), Math.max(flat.length - 1, 0)));
    } else if (event.key === "Enter") {
      event.preventDefault();
      flat[activeIdx]?.onSelect?.();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose?.();
    }
  };

  let runningIdx = -1;

  return (
    <div className={cx("mk-cmdk", className)} {...rest}>
      <div className="mk-cmdk-search">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.4 9.4 L12.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          aria-label="Rechercher une commande"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIdx(0);
          }}
          onKeyDown={onKeyDown}
        />
        <Kbd>esc</Kbd>
      </div>
      <div className="mk-cmdk-list">
        {filtered.map((group, gi) => (
          <React.Fragment key={gi}>
            <div className="mk-cmdk-group">{group.label}</div>
            {group.items.map((item, ii) => {
              runningIdx += 1;
              const idx = runningIdx;
              return (
                <button
                  key={ii}
                  type="button"
                  className={cx("mk-cmdk-item", idx === activeIdx && "is-active")}
                  onMouseMove={() => setActiveIdx(idx)}
                  onClick={() => item.onSelect?.()}
                >
                  {item.icon}
                  {item.label}
                  {item.kbd != null && <Kbd>{item.kbd}</Kbd>}
                </button>
              );
            })}
          </React.Fragment>
        ))}
        {flat.length === 0 && <div className="mk-cmdk-empty">{emptyMessage}</div>}
      </div>
      {footer !== null && (
        <div className="mk-cmdk-foot">
          {footer ?? (
            <>
              <span className="hint">
                <Kbd>↑↓</Kbd> naviguer
              </span>
              <span className="hint">
                <Kbd>↵</Kbd> exécuter
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
