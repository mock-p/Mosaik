import * as React from "react";
import { cx } from "../../internal/cx";

export interface CardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: React.ReactNode;
  author?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  iconTone?: "primary" | "coral";
  badge?: React.ReactNode;
  action?: React.ReactNode;
  row?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    title,
    author,
    description,
    icon,
    iconTone = "primary",
    badge,
    action,
    row = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("mk-card", row && "mk-card-row", className)}
      {...rest}
    >
      {(icon != null || title != null || author != null) && (
        <div className="mk-card-head">
          {icon != null && (
            <div
              className={cx("mk-card-icon", iconTone === "coral" && "coral")}
            >
              {icon}
            </div>
          )}
          {(title != null || author != null) && (
            <div className="mk-card-id">
              {title != null && <div className="mk-card-title">{title}</div>}
              {author != null && <div className="mk-card-author">{author}</div>}
            </div>
          )}
        </div>
      )}
      {description != null && <p className="mk-card-desc">{description}</p>}
      {children}
      {(badge != null || action != null) && (
        <div className="mk-card-foot">
          {badge}
          {action}
        </div>
      )}
    </div>
  );
});
