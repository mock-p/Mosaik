import * as React from "react";
import { cx } from "../../internal/cx";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarTone = "default" | "coral" | "solid";
export type AvatarStatus = "online" | "away";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Initials (or any short content). */
  children?: React.ReactNode;
  /** @default "md" */
  size?: AvatarSize;
  /** @default "default" */
  tone?: AvatarTone;
  /** Status dot in the corner, Mosaik corner motif. */
  status?: AvatarStatus;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { size = "md", tone = "default", status, className, children, ...rest },
  ref,
) {
  const avatar = (
    <span
      ref={ref}
      className={cx(
        "mk-avatar",
        size !== "md" && size,
        tone !== "default" && tone,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );

  if (status == null) return avatar;
  return (
    <span className="mk-avatar-wrap">
      {avatar}
      <span className={cx("dot", status === "away" && "away")} />
    </span>
  );
});

export interface AvatarStackProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Collapses into a "+N" avatar. */
  more?: number;
}

/** Overlapping avatar group with an optional "+N" tail. */
export function AvatarStack({ more, className, children, ...rest }: AvatarStackProps) {
  return (
    <span className={cx("mk-avatar-stack", className)} {...rest}>
      {children}
      {more != null && more > 0 && <span className="mk-avatar more">+{more}</span>}
    </span>
  );
}
