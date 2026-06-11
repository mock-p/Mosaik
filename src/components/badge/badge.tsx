import * as React from "react";
import { cx } from "../../internal/cx";

export type BadgeVariant = "success" | "neutral" | "info" | "featured" | "danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "neutral", icon, className, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx("mk-badge", `mk-badge-${variant}`, className)} {...rest}>
      {icon}
      {children}
    </span>
  );
});
