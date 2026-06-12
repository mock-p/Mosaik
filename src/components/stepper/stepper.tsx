import * as React from "react";
import { cx } from "../../internal/cx";

export interface StepperProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

/** Numeric stepper — − / value / + with clamped bounds. */
export function Stepper({
  value,
  defaultValue = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel,
  ...rest
}: StepperProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const current = value ?? internal;

  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    if (value === undefined) setInternal(clamped);
    onChange?.(clamped);
  };

  return (
    <div className={cx("mk-stepper", className)} {...rest}>
      <button
        type="button"
        aria-label="Decrease"
        disabled={disabled || current <= min}
        onClick={() => set(current - step)}
      >
        −
      </button>
      <input
        type="number"
        value={current}
        min={Number.isFinite(min) ? min : undefined}
        max={Number.isFinite(max) ? max : undefined}
        step={step}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          if (!Number.isNaN(parsed)) set(parsed);
        }}
      />
      <button
        type="button"
        aria-label="Increase"
        disabled={disabled || current >= max}
        onClick={() => set(current + step)}
      >
        +
      </button>
    </div>
  );
}
