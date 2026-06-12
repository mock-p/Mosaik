import * as React from "react";
import { cx } from "../../internal/cx";
import { CrossGlyph, WarnGlyph } from "../../internal/glyphs";
import { Triangle } from "../triangle";

export type BannerVariant = "brand" | "warning";

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "brand" */
  variant?: BannerVariant;
  /** Replaces the default semantic glyph. */
  icon?: React.ReactNode;
  /** Action slot, typically a small `Button`. */
  action?: React.ReactNode;
  /** Shows the × button and is called on click. */
  onDismiss?: () => void;
}

/** Full-width announcement banner — brand (solid blue) or warning (tinted). */
export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { variant = "brand", icon, action, onDismiss, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("mk-banner", `mk-banner-${variant}`, className)}
      {...rest}
    >
      <span className="mk-banner-glyph">
        {icon ?? (variant === "warning" ? <WarnGlyph size={14} /> : <Triangle size={14} />)}
      </span>
      <span className="mk-banner-text">{children}</span>
      {action}
      {onDismiss != null && (
        <button className="mk-banner-x" type="button" aria-label="Dismiss" onClick={onDismiss}>
          <CrossGlyph />
        </button>
      )}
    </div>
  );
});
