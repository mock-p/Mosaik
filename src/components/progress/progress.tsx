import * as React from "react";
import { cx } from "../../internal/cx";
import { Triangle } from "../triangle";

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
    { value = 0, label, valueText, success, indeterminate, className, ...rest },
    ref,
  ) {
    const showHead = label != null || valueText != null;
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : value}
        className={cx("mk-progress", success && "is-success", className)}
        {...rest}
      >
        {showHead && (
          <div className="mk-progress-head">
            <span>{label}</span>
            <span className="pct">
              {valueText ?? (indeterminate ? null : `${value} %`)}
            </span>
          </div>
        )}
        <div className="mk-progress-track">
          <div
            className={cx("mk-progress-fill", indeterminate && "indeterminate")}
            style={indeterminate ? undefined : { width: `${value}%` }}
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
