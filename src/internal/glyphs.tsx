import * as React from "react";
import { Triangle } from "../components/triangle";

interface GlyphProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
}

/** Check mark, used by success states. */
export function CheckGlyph({ size = 14, strokeWidth = 2, ...rest }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" {...rest}>
      <path
        d="M3.5 8.5 l3 3 6-6.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Cross, used by error states and dismiss buttons. */
export function CrossGlyph({ size = 9, strokeWidth = 1.6, ...rest }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" aria-hidden="true" {...rest}>
      <path
        d="M1 1l6 6M7 1L1 7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Mosaik triangle with an exclamation mark — warning states. */
export function WarnGlyph({ size = 14, ...rest }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" {...rest}>
      <path d="M8 2.5 L12.25 9.84 Q13.5 12 11 12 H5 Q2.5 12 3.75 9.84 Z" fill="currentColor" />
      <rect x="7.3" y="5.4" width="1.4" height="3.4" rx="0.7" fill="#FFFFFF" />
      <circle cx="8" cy="10.4" r="0.85" fill="#FFFFFF" />
    </svg>
  );
}

/** Right-pointing Mosaik triangle — info states. */
export function InfoGlyph({ size = 14 }: GlyphProps) {
  return <Triangle size={size} direction="right" />;
}
