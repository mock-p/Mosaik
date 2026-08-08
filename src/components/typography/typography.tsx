import * as React from "react";
import { cx } from "../../internal/cx";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "display" | "2xl" | "xl" | "lg" | "md" | "sm";
export type TextSize = "xs" | "sm" | "md" | "lg";
export type TextTone = "default" | "muted" | "brand" | "inverse" | "danger" | "success";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Semantic heading level. @default 2 */
  level?: HeadingLevel;
  /** Visual size can differ from semantic level. */
  size?: HeadingSize;
  balance?: boolean;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level = 2, size, balance = true, className, ...rest },
  ref,
) {
  const tag = `h${level}`;
  return React.createElement(tag, {
    ref,
    className: cx(
      "mk-heading",
      size ? `mk-heading-${size}` : `mk-heading-level-${level}`,
      balance && "mk-heading-balance",
      className,
    ),
    ...rest,
  });
});

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "p" | "span" | "div" | "small";
  size?: TextSize;
  tone?: TextTone;
  weight?: "regular" | "medium" | "semibold";
  measure?: "none" | "short" | "default" | "long";
}

export function Text({
  as = "p",
  size = "md",
  tone = "default",
  weight = "regular",
  measure = "none",
  className,
  ...rest
}: TextProps) {
  return React.createElement(as, {
    className: cx(
      "mk-text",
      `mk-text-${size}`,
      `mk-text-${tone}`,
      `mk-text-${weight}`,
      measure !== "none" && `mk-text-measure-${measure}`,
      className,
    ),
    ...rest,
  });
}

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Reading width. @default "default" */
  measure?: "short" | "default" | "long";
}

export const Prose = React.forwardRef<HTMLDivElement, ProseProps>(function Prose(
  { measure = "default", className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("mk-prose", `mk-prose-${measure}`, className)} {...rest} />;
});
