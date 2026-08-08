import * as React from "react";
import { cx } from "../../internal/cx";

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  /** Right-aligned slot in the header, e.g. a `Badge`. */
  meta?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onToggle"> {
  items: AccordionItem[];
  /** Controlled open ids. */
  open?: string[];
  defaultOpen?: string[];
  onToggle?: (open: string[]) => void;
  /** Allow more than one panel to be open. @default true */
  multiple?: boolean;
  /** Allow the last open panel to close. @default true */
  collapsible?: boolean;
  /** Semantic heading level around each trigger. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/** Accessible accordion with controlled and uncontrolled modes. */
export function Accordion({
  items,
  open,
  defaultOpen,
  onToggle,
  multiple = true,
  collapsible = true,
  headingLevel = 3,
  className,
  ...rest
}: AccordionProps) {
  const generatedId = React.useId();
  const [internal, setInternal] = React.useState<string[]>(() => defaultOpen ?? []);
  const openIds = open ?? internal;
  const HeadingTag = `h${headingLevel}` as React.ElementType;

  const toggle = (item: AccordionItem) => {
    if (item.disabled) return;
    const isOpen = openIds.includes(item.id);
    if (isOpen && !collapsible && openIds.length === 1) return;
    const next = isOpen
      ? openIds.filter((id) => id !== item.id)
      : multiple
        ? [...openIds, item.id]
        : [item.id];
    if (open === undefined) setInternal(next);
    onToggle?.(next);
  };

  return (
    <div className={cx("mk-acc", className)} {...rest}>
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const triggerId = `${generatedId}-trigger-${index}`;
        const panelId = `${generatedId}-panel-${index}`;
        return (
          <div
            key={item.id}
            className={cx("mk-acc-item", isOpen && "open", item.disabled && "is-disabled")}
          >
            <HeadingTag className="mk-acc-heading">
              <button
                id={triggerId}
                className="mk-acc-head"
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item)}
              >
                <span className="tri" aria-hidden="true">
                  <svg width="11" height="9" viewBox="0 0 12 10">
                    <path
                      d="M3.2 1.5 H8.8 Q11 1.5 9.78 3.33 L6 9 L2.22 3.33 Q1 1.5 3.2 1.5 Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span className="mk-acc-title">{item.title}</span>
                {item.meta != null && <span className="meta">{item.meta}</span>}
              </button>
            </HeadingTag>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              inert={!isOpen}
              className="mk-acc-body"
            >
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
