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
  /** Pages shown around the current one. @default 1 */
  siblingCount?: number;
}

type PageToken = number | "dots";

function buildRange(page: number, count: number, siblings: number): PageToken[] {
  const tokens: PageToken[] = [];
  const start = Math.max(2, page - siblings);
  const end = Math.min(count - 1, page + siblings);
  tokens.push(1);
  if (start > 2) tokens.push("dots");
  for (let p = start; p <= end; p++) tokens.push(p);
  if (end < count - 1) tokens.push("dots");
  if (count > 1) tokens.push(count);
  return tokens;
}

/** Pagination — current page in solid blue, Mosaik triangle arrows. */
export function Pagination({
  page,
  count,
  onChange,
  siblingCount = 1,
  className,
  ...rest
}: PaginationProps) {
  const go = (p: number) => {
    if (p >= 1 && p <= count && p !== page) onChange?.(p);
  };

  return (
    <nav aria-label="Pagination" className={cx("mk-page", className)} {...rest}>
      <button
        type="button"
        aria-label="Previous"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
      >
        <Triangle size={9} direction="left" />
      </button>
      {buildRange(page, count, siblingCount).map((token, i) =>
        token === "dots" ? (
          <span key={`dots-${i}`} className="dots">
            …
          </span>
        ) : (
          <button
            key={token}
            type="button"
            aria-current={token === page ? "page" : undefined}
            className={cx(token === page && "is-current")}
            onClick={() => go(token)}
          >
            {token}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next"
        disabled={page >= count}
        onClick={() => go(page + 1)}
      >
        <Triangle size={9} direction="right" />
      </button>
    </nav>
  );
}
