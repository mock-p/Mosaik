import * as React from "react";
import { cx } from "../../internal/cx";

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  /** Right-aligned slot in the header, e.g. a `Badge`. */
  meta?: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onToggle"> {
  items: AccordionItem[];
  /** Controlled open ids. */
  open?: string[];
  defaultOpen?: string[];
  onToggle?: (open: string[]) => void;
}

/**
 * Accordion — rotating Mosaik triangle, smooth grid-rows reveal.
 * Items open independently.
 */
export function Accordion({
  items,
  open,
  defaultOpen,
  onToggle,
  className,
  ...rest
}: AccordionProps) {
  const [internal, setInternal] = React.useState<string[]>(() => defaultOpen ?? []);
  const openIds = open ?? internal;

  const toggle = (id: string) => {
    const next = openIds.includes(id)
      ? openIds.filter((x) => x !== id)
      : [...openIds, id];
    if (open === undefined) setInternal(next);
    onToggle?.(next);
  };

  return (
    <div className={cx("mk-acc", className)} {...rest}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className={cx("mk-acc-item", isOpen && "open")}>
            <button
              className="mk-acc-head"
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
            >
              <span className="tri">
                <svg width="11" height="9" viewBox="0 0 12 10" aria-hidden="true">
                  <path
                    d="M3.2 1.5 H8.8 Q11 1.5 9.78 3.33 L6 9 L2.22 3.33 Q1 1.5 3.2 1.5 Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              {item.title}
              {item.meta != null && <span className="meta">{item.meta}</span>}
            </button>
            <div className="mk-acc-body">
              <div>
                <div className="mk-acc-content">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
