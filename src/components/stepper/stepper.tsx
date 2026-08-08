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
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Visible label for the numeric input. */
  label?: React.ReactNode;
  /** Supporting or validation text announced with the input. */
  helper?: React.ReactNode;
  inputId?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  name?: string;
  decreaseLabel?: string;
  increaseLabel?: string;
  /** Accessible input name when no visible `label` is provided. @default "Value" */
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
  readOnly = false,
  required = false,
  invalid = false,
  label,
  helper,
  inputId,
  inputRef,
  name,
  decreaseLabel = "Decrease value",
  increaseLabel = "Increase value",
  className,
  "aria-label": ariaLabel = "Value",
  ...rest
}: StepperProps) {
  const generatedId = React.useId();
  const resolvedInputId = inputId ?? `${generatedId}-input`;
  const helperId = helper == null ? undefined : `${generatedId}-helper`;
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  const normalizedMin = Number.isNaN(min) ? -Infinity : min;
  const normalizedMax = Number.isNaN(max) ? Infinity : max;
  const lowerBound = Math.min(normalizedMin, normalizedMax);
  const upperBound = Math.max(normalizedMin, normalizedMax);
  const clamp = React.useCallback(
    (next: number) => Math.min(upperBound, Math.max(lowerBound, next)),
    [lowerBound, upperBound],
  );
  const [internal, setInternal] = React.useState(() =>
    clamp(Number.isFinite(defaultValue) ? defaultValue : 0),
  );
  const [draft, setDraft] = React.useState<string | null>(null);
  const rawCurrent = value ?? internal;
  const current = clamp(Number.isFinite(rawCurrent) ? rawCurrent : 0);

  const set = React.useCallback(
    (next: number) => {
      if (!Number.isFinite(next)) return;
      const clamped = clamp(next);
      if (value === undefined) setInternal(clamped);
      onChange?.(clamped);
    },
    [clamp, onChange, value],
  );

  const commitDraft = () => {
    if (draft != null && draft.trim() !== "") {
      const parsed = Number(draft);
      if (Number.isFinite(parsed) && clamp(parsed) !== current) set(parsed);
    }
    setDraft(null);
  };

  const controlsDisabled = disabled || readOnly;
  const inputLabel = label == null ? ariaLabel : undefined;
  const hasFieldShell = label != null || helper != null;

  const control = (
    <div
      className={cx(
        "mk-stepper",
        !hasFieldShell && invalid && "is-invalid",
        !hasFieldShell && className,
      )}
      data-disabled={!hasFieldShell && disabled ? true : undefined}
      data-readonly={!hasFieldShell && readOnly ? true : undefined}
      {...(!hasFieldShell ? rest : {})}
    >
      <button
        type="button"
        aria-label={decreaseLabel}
        disabled={controlsDisabled || current <= lowerBound}
        onClick={() => set(current - safeStep)}
      >
        −
      </button>
      <input
        ref={inputRef}
        id={resolvedInputId}
        name={name}
        type="number"
        value={draft ?? current}
        min={Number.isFinite(lowerBound) ? lowerBound : undefined}
        max={Number.isFinite(upperBound) ? upperBound : undefined}
        step={safeStep}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        aria-label={inputLabel}
        aria-describedby={helperId}
        aria-invalid={invalid || undefined}
        onFocus={() => setDraft(String(current))}
        onChange={(event) => {
          const nextDraft = event.target.value;
          setDraft(nextDraft);
          if (nextDraft.trim() === "") return;
          const parsed = Number(nextDraft);
          if (Number.isFinite(parsed)) set(parsed);
        }}
        onBlur={commitDraft}
      />
      <button
        type="button"
        aria-label={increaseLabel}
        disabled={controlsDisabled || current >= upperBound}
        onClick={() => set(current + safeStep)}
      >
        +
      </button>
    </div>
  );

  if (!hasFieldShell) return control;

  return (
    <div
      className={cx("mk-stepper-field", invalid && "is-invalid", className)}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      {...rest}
    >
      {label != null && (
        <label className="mk-stepper-label" htmlFor={resolvedInputId}>
          {label}
        </label>
      )}
      {control}
      {helper != null && (
        <span id={helperId} className="mk-stepper-helper">
          {helper}
        </span>
      )}
    </div>
  );
}
