import * as React from "react";
import { cx } from "../../internal/cx";
import { Triangle } from "../triangle";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  /** Replaces the default two-shapes Mosaik illustration. */
  art?: React.ReactNode;
  /** Call-to-action, typically a `Button`. */
  action?: React.ReactNode;
}

/** Dashed empty state with the two Mosaik shapes as illustration. */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ title, art, action, className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cx("mk-empty", className)} {...rest}>
        {art !== null && (
          <div className="mk-empty-art">
            {art ?? (
              <>
                <span className="sq" />
                <Triangle size={26} style={{ color: "#FF6E64" }} />
              </>
            )}
          </div>
        )}
        {title != null && <div className="mk-empty-title">{title}</div>}
        {children != null && <div className="mk-empty-text">{children}</div>}
        {action}
      </div>
    );
  },
);
