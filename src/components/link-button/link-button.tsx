import * as React from "react";
import { cx } from "../../internal/cx";
import type { ButtonSize, ButtonVariant } from "../button";

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  iconOnly?: boolean;
  fullWidth?: boolean;
  uppercase?: boolean;
  cornerAxis?: "tlbr" | "trbl";
  /** Removes the link from navigation and exposes `aria-disabled`. */
  disabled?: boolean;
}

/** Anchor with Mosaik button styling. Use for navigation; use `Button` for actions. */
export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  {
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "start",
    iconOnly = false,
    fullWidth = false,
    uppercase = false,
    cornerAxis,
    disabled = false,
    "aria-disabled": ariaDisabled,
    href: destination,
    tabIndex,
    onClick,
    className,
    children,
    ...rest
  },
  ref,
) {
  const effectiveDisabled = disabled || ariaDisabled === true || ariaDisabled === "true";
  return (
    <a
      ref={ref}
      href={effectiveDisabled ? undefined : destination}
      tabIndex={effectiveDisabled ? -1 : tabIndex}
      data-mk-corner={cornerAxis === "trbl" ? "trbl" : undefined}
      className={cx(
        "mk-btn",
        `mk-btn-${variant}`,
        size !== "md" && `mk-btn-${size}`,
        iconOnly && "mk-btn-icon",
        fullWidth && "mk-btn-block",
        uppercase && "mk-btn-upper",
        effectiveDisabled && "is-disabled",
        className,
      )}
      onClick={(event) => {
        if (effectiveDisabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
      aria-disabled={effectiveDisabled || undefined}
    >
      {iconPosition === "start" && icon}
      {!iconOnly && children}
      {iconPosition === "end" && icon}
    </a>
  );
});
