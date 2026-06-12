import * as React from "react";
import { cx } from "../../internal/cx";

export type SkeletonVariant = "line" | "title" | "square";

export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** line 12px / title 16px / square 44×44 with card-icon radius. @default "line" */
  variant?: SkeletonVariant;
  /** Shorthand for style.width, e.g. "55%" or 120. */
  width?: number | string;
}

/** Loading placeholder with the Mosaik shimmer. */
export function Skeleton({ variant = "line", width, className, style, ...rest }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx("mk-sk", variant, className)}
      style={width != null ? { width, ...style } : style}
      {...rest}
    />
  );
}
