import * as React from "react";
import { cx } from "../../internal/cx";
import { CheckGlyph, CrossGlyph, InfoGlyph, WarnGlyph } from "../../internal/glyphs";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Semantic tone — colors border, background and glyph. @default "info" */
  variant?: AlertVariant;
  /** Bold display-font heading. */
  title?: React.ReactNode;
  /** Replaces the default semantic glyph. */
  icon?: React.ReactNode;
  /** Shows the dismiss button and is called on click. */
  onDismiss?: () => void;
}

const DEFAULT_GLYPH: Record<AlertVariant, React.ReactNode> = {
  info: <InfoGlyph size={14} />,
  success: <CheckGlyph size={14} />,
  warning: <WarnGlyph size={14} />,
  danger: <CrossGlyph size={12} strokeWidth={1.8} />,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant = "info", title, icon, onDismiss, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="alert"
      className={cx("mk-alert", `mk-alert-${variant}`, className)}
      {...rest}
    >
      <span className="mk-alert-glyph">{icon ?? DEFAULT_GLYPH[variant]}</span>
      <span className="mk-alert-body">
        {title != null && <span className="mk-alert-title">{title}</span>}
        {children != null && <span className="mk-alert-text">{children}</span>}
      </span>
      {onDismiss != null && (
        <button className="mk-alert-x" type="button" aria-label="Dismiss" onClick={onDismiss}>
          <CrossGlyph />
        </button>
      )}
    </div>
  );
});
