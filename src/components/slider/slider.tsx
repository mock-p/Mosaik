import * as React from "react";
import { cx } from "../../internal/cx";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "onChange"> {
  label?: React.ReactNode;
  /** Suffix in the value chip, e.g. " s". */
  unit?: string;
  /** Hide the live value chip. */
  showValue?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}

/** Range slider — Mosaik square thumb, live value chip, filled track. */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    label,
    unit = "",
    showValue = true,
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    onChange,
    className,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    ...rest
  },
  ref,
) {
  const isControlled = value !== undefined;
  const generatedId: string = React.useId();
  const inputId = id ?? generatedId /* React.useId fallback */;
  const normalizedAriaLabel = ariaLabel?.trim() || undefined;
  const normalizedAriaLabelledby = ariaLabelledby?.trim() || undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? min);
  const current = value ?? internal;
  const pct = ((current - min) / (max - min || 1)) * 100;

  return (
    <div className={cx("mk-slider", className)}>
      {(label != null || showValue) && (
        <div className="mk-slider-head">
          {label != null && (
            <label htmlFor={inputId} className="mk-field-label">
              {label}
            </label>
          )}
          {showValue && (
            <span className="val">
              {current}
              {unit}
            </span>
          )}
        </div>
      )}
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        style={{ "--val": `${pct}%` } as React.CSSProperties}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!isControlled) setInternal(next);
          onChange?.(next);
        }}
        {...rest}
        id={inputId}
        aria-label={normalizedAriaLabel ?? (label == null && normalizedAriaLabelledby == null ? "Value" : undefined)}
        aria-labelledby={normalizedAriaLabelledby}
      />
    </div>
  );
});

Slider.displayName = "Slider";
