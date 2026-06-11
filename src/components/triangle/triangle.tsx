import * as React from "react";

export type TriangleDirection = "up" | "right" | "down" | "left";

export interface TriangleProps extends React.SVGAttributes<SVGSVGElement> {
  /** Pixel size of the glyph. */
  size?: number;
  /** Where the sharp tip points. */
  direction?: TriangleDirection;
}

const ROTATION: Record<TriangleDirection, number> = {
  up: 0,
  right: 90,
  down: 180,
  left: 270,
};

/**
 * The Mosaik triangle — two rounded corners, one sharp tip.
 * Used as select chevron, loading spinner, helper-text marker and run icon.
 */
export const Triangle = React.forwardRef<SVGSVGElement, TriangleProps>(
  function Triangle({ size = 13, direction = "up", ...rest }, ref) {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        aria-hidden="true"
        {...rest}
      >
        <path
          d="M8 2.5 L12.25 9.84 Q13.5 12 11 12 H5 Q2.5 12 3.75 9.84 Z"
          fill="currentColor"
          transform={direction === "up" ? undefined : `rotate(${ROTATION[direction]} 8 8)`}
        />
      </svg>
    );
  },
);
