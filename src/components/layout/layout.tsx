import * as React from "react";
import { cx } from "../../internal/cx";

export type LayoutGap = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";
export type SectionSpacing = "sm" | "md" | "lg" | "xl";
export type SurfaceVariant = "plain" | "outlined" | "subtle" | "raised" | "inverse";
export type SurfacePadding = "none" | "sm" | "md" | "lg";

const gapClass: Record<LayoutGap, string> = {
  none: "mk-gap-none",
  xs: "mk-gap-xs",
  sm: "mk-gap-sm",
  md: "mk-gap-md",
  lg: "mk-gap-lg",
  xl: "mk-gap-xl",
  "2xl": "mk-gap-2xl",
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum content width. @default "lg" */
  size?: ContainerSize;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { size = "lg", className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("mk-container", `mk-container-${size}`, className)} {...rest} />;
});

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Vertical breathing room. @default "lg" */
  spacing?: SectionSpacing;
  /** Background treatment. @default "default" */
  tone?: "default" | "subtle" | "surface" | "inverse";
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(function Section(
  { spacing = "lg", tone = "default", className, ...rest },
  ref,
) {
  return (
    <section
      ref={ref}
      className={cx("mk-section", `mk-section-${spacing}`, `mk-section-${tone}`, className)}
      {...rest}
    />
  );
});

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Vertical gap between children. @default "md" */
  gap?: LayoutGap;
  align?: "stretch" | "start" | "center" | "end";
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack(
  { gap = "md", align = "stretch", className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("mk-stack", gapClass[gap], `mk-align-${align}`, className)}
      {...rest}
    />
  );
});

export interface ClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Wrapped horizontal gap. @default "sm" */
  gap?: LayoutGap;
  align?: "start" | "center" | "end" | "baseline";
  justify?: "start" | "center" | "end" | "between";
}

export const Cluster = React.forwardRef<HTMLDivElement, ClusterProps>(function Cluster(
  { gap = "sm", align = "center", justify = "start", className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        "mk-cluster",
        gapClass[gap],
        `mk-align-${align}`,
        `mk-justify-${justify}`,
        className,
      )}
      {...rest}
    />
  );
});

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fixed columns, or auto-fit with `minItemWidth`. @default 2 */
  columns?: 1 | 2 | 3 | 4 | "auto";
  gap?: LayoutGap;
  /** Minimum card width used by `columns="auto"`. @default "16rem" */
  minItemWidth?: number | string;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(function Grid(
  { columns = 2, gap = "lg", minItemWidth = "16rem", className, style, ...rest },
  ref,
) {
  const gridStyle =
    columns === "auto"
      ? ({
          "--mk-grid-min": typeof minItemWidth === "number" ? `${minItemWidth}px` : minItemWidth,
          ...style,
        } as React.CSSProperties)
      : style;
  return (
    <div
      ref={ref}
      className={cx("mk-grid", `mk-grid-${columns}`, gapClass[gap], className)}
      style={gridStyle}
      {...rest}
    />
  );
});

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  padding?: SurfacePadding;
  /** Flip the asymmetric corners for visual rhythm. */
  cornerAxis?: "tlbr" | "trbl";
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  {
    variant = "outlined",
    padding = "md",
    cornerAxis,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      data-mk-corner={cornerAxis === "trbl" ? "trbl" : undefined}
      className={cx("mk-surface", `mk-surface-${variant}`, `mk-surface-pad-${padding}`, className)}
      {...rest}
    />
  );
});

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** @default "subtle" */
  tone?: "subtle" | "strong" | "brand";
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(function Divider(
  { tone = "subtle", className, ...rest },
  ref,
) {
  return <hr ref={ref} className={cx("mk-divider", `mk-divider-${tone}`, className)} {...rest} />;
});
