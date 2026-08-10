import * as React from "react";
import { cx } from "../../internal/cx";
import { Triangle } from "../triangle";

type ProgressScaleStyle = React.CSSProperties & { "--mk-progress-scale": number };

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. Ignored when `indeterminate`. */
  value?: number;
  /** Label above the bar (left side). */
  label?: React.ReactNode;
  /** Percentage readout (right side). Defaults to "value %" when a label is set. */
  valueText?: React.ReactNode;
  /** Green fill. */
  success?: boolean;
  /** Sweeping animation, no value. */
  indeterminate?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(
    {
      value = 0,
      label,
      valueText,
      success,
      indeterminate,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      ...rest
    },
    ref,
  ) {
    const labelId = React.useId();
    const normalizedAriaLabel = ariaLabel?.trim() || undefined;
    const normalizedAriaLabelledby = ariaLabelledby?.trim() || undefined;
    const normalizedValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
    const showHead = label != null || valueText != null;
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : normalizedValue}
        className={cx("mk-progress", success && "is-success", className)}
        {...rest}
        aria-label={normalizedAriaLabel ?? (label == null && normalizedAriaLabelledby == null ? "Progress" : undefined)}
        aria-labelledby={normalizedAriaLabelledby ?? (normalizedAriaLabel == null && label != null ? labelId : undefined)}
      >
        {showHead && (
          <div className="mk-progress-head">
            <span id={labelId}>{label}</span>
            <span className="pct">
              {valueText ?? (indeterminate ? null : `${normalizedValue} %`)}
            </span>
          </div>
        )}
        <div className="mk-progress-track">
          <div
            className={cx("mk-progress-fill", indeterminate && "indeterminate")}
            style={
              indeterminate
                ? undefined
                : ({ "--mk-progress-scale": normalizedValue / 100 } as ProgressScaleStyle)
            }
          />
        </div>
      </div>
    );
  },
);

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Pixel size of the triangle. @default 18 */
  size?: number;
}

/** Standalone spinning Mosaik triangle. */
export function Spinner({ size = 18, className, ...rest }: SpinnerProps) {
  return (
    <span role="status" aria-label="Loading" className={cx("mk-spin", className)} {...rest}>
      <Triangle size={size} />
    </span>
  );
}
