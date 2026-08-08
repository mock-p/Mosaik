import * as React from "react";
import { cx } from "../../internal/cx";
import { Triangle } from "../triangle";

export interface PaginationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Current page, 1-based. */
  page: number;
  /** Total number of pages. */
  count: number;
  onChange?: (page: number) => void;
  /** Return a URL to render real anchors; without it controls are buttons. */
  getHref?: (page: number) => string | undefined;
  /** Prevent anchor navigation when `onChange` handles routing. @default false */
  preventDefaultOnChange?: boolean;
  /** Pages shown around the current one. @default 1 */
  siblingCount?: number;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: (page: number) => string;
  ellipsisLabel?: string;
}

type PageToken = number | "dots";

function buildRange(page: number, count: number, siblings: number): PageToken[] {
  const tokens: PageToken[] = [];
  const start = Math.max(2, page - siblings);
  const end = Math.min(count - 1, page + siblings);
  tokens.push(1);
  if (start > 2) tokens.push("dots");
  for (let current = start; current <= end; current += 1) tokens.push(current);
  if (end < count - 1) tokens.push("dots");
  if (count > 1) tokens.push(count);
  return tokens;
}

/** Pagination with link and button modes, compact range and localized labels. */
export function Pagination({
  page,
  count,
  onChange,
  getHref,
  preventDefaultOnChange = false,
  siblingCount = 1,
  previousLabel = "Previous page",
  nextLabel = "Next page",
  pageLabel = (current) => `Page ${current}`,
  ellipsisLabel = "More pages",
  className,
  "aria-label": ariaLabel = "Pagination",
  ...rest
}: PaginationProps) {
  const pageCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (pageCount === 0) return null;
  const currentPage = Number.isFinite(page)
    ? Math.min(pageCount, Math.max(1, Math.floor(page)))
    : 1;
  const siblings = Number.isFinite(siblingCount)
    ? Math.max(0, Math.floor(siblingCount))
    : 1;

  const activate = (nextPage: number, event?: React.MouseEvent<HTMLAnchorElement>) => {
    if (nextPage < 1 || nextPage > pageCount || nextPage === currentPage) {
      if (nextPage !== currentPage) event?.preventDefault();
      return;
    }
    if (preventDefaultOnChange) event?.preventDefault();
    onChange?.(nextPage);
  };

  const control = (
    targetPage: number,
    content: React.ReactNode,
    label: string,
    options: { current?: boolean; disabled?: boolean; key?: React.Key } = {},
  ) => {
    const disabled = options.disabled ?? false;
    const href = !disabled ? getHref?.(targetPage) : undefined;
    const shared = {
      className: cx("mk-page-control", options.current && "is-current"),
      "aria-label": label,
      "aria-current": options.current ? ("page" as const) : undefined,
    };

    if (disabled) {
      return (
        <span key={options.key} {...shared} className={cx(shared.className, "is-disabled")} aria-disabled="true">
          {content}
        </span>
      );
    }
    if (href != null) {
      return (
        <a
          key={options.key}
          {...shared}
          href={href}
          onClick={(event) => activate(targetPage, event)}
        >
          {content}
        </a>
      );
    }
    return (
      <button
        key={options.key}
        {...shared}
        type="button"
        disabled={options.current}
        onClick={() => activate(targetPage)}
      >
        {content}
      </button>
    );
  };

  return (
    <nav aria-label={ariaLabel} className={cx("mk-page", className)} {...rest}>
      {control(currentPage - 1, <Triangle size={9} direction="left" />, previousLabel, {
        disabled: currentPage <= 1,
        key: "previous",
      })}
      {buildRange(currentPage, pageCount, siblings).map((token, index) =>
        token === "dots" ? (
          <span key={`dots-${index}`} className="dots">
            <span aria-hidden="true">…</span>
            <span className="mk-sr-only">{ellipsisLabel}</span>
          </span>
        ) : (
          control(token, token, pageLabel(token), {
            current: token === currentPage,
            key: token,
          })
        ),
      )}
      {control(currentPage + 1, <Triangle size={9} direction="right" />, nextLabel, {
        disabled: currentPage >= pageCount,
        key: "next",
      })}
    </nav>
  );
}
