import * as React from "react";
import { cx } from "../../internal/cx";
import { Triangle } from "../triangle";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tonal"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: ButtonVariant;
  /** Control height: 32 / 42 / 50px. @default "md" */
  size?: ButtonSize;
  /** Shows the spinning triangle and disables interaction. */
  loading?: boolean;
  /** Glyph rendered next to the label (hidden while loading). */
  icon?: React.ReactNode;
  /** Side of the label the icon sits on. @default "start" */
  iconPosition?: "start" | "end";
  /** Square button with the icon only — provide an `aria-label`. */
  iconOnly?: boolean;
  /** Stretch to the parent width. */
  fullWidth?: boolean;
  /** Uppercase label with wide letter-spacing. */
  uppercase?: boolean;
  /** Flip the rounded-corner axis (TL·BR ↔ TR·BL). @default "tlbr" */
  cornerAxis?: "tlbr" | "trbl";
}

const SPINNER_SIZE: Record<ButtonSize, number> = { sm: 12, md: 14, lg: 16 };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "start",
      iconOnly = false,
      fullWidth = false,
      uppercase = false,
      cornerAxis,
      disabled,
      className,
      children,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const glyph = loading ? (
      <Triangle className="mk-spinner" size={SPINNER_SIZE[size]} />
    ) : (
      icon
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        aria-busy={loading || undefined}
        data-mk-corner={cornerAxis === "trbl" ? "trbl" : undefined}
        className={cx(
          "mk-btn",
          `mk-btn-${variant}`,
          size !== "md" && `mk-btn-${size}`,
          iconOnly && "mk-btn-icon",
          fullWidth && "mk-btn-block",
          uppercase && "mk-btn-upper",
          loading && "is-loading",
          className,
        )}
        {...rest}
      >
        {iconPosition === "start" && glyph}
        {!iconOnly && children}
        {iconPosition === "end" && glyph}
      </button>
    );
  },
);
