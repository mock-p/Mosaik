import * as React from "react";
import { cx } from "../../internal/cx";
import { Triangle } from "../triangle";

export type FieldStatus = "error" | "success";

export interface FieldShellProps {
  /** Uppercase display-font label above the control. */
  label?: React.ReactNode;
  /** Muted hint on the right of the label row ("Required", "Optional"…). */
  labelHint?: React.ReactNode;
  /** Helper text under the control. */
  helper?: React.ReactNode;
  /** Right-aligned slot in the helper row (e.g. a character count). */
  helperEnd?: React.ReactNode;
  /** Colors the border and helper; adds the triangle marker. */
  status?: FieldStatus;
  className?: string;
}

interface FieldShellInternalProps extends FieldShellProps {
  /** id of the control, used for the `<label for>` wiring. */
  htmlFor?: string;
  /** Render the label as a `<div>` (for non-labelable controls). */
  labelAsDiv?: boolean;
  children: React.ReactNode;
}

/**
 * Shared layout for labelled controls: label row, control, helper row.
 * Error/success states mark the helper with the Mosaik triangle.
 */
export function FieldShell({
  label,
  labelHint,
  helper,
  helperEnd,
  status,
  htmlFor,
  labelAsDiv = false,
  className,
  children,
}: FieldShellInternalProps) {
  const LabelTag = labelAsDiv ? "div" : "label";
  return (
    <div
      className={cx(
        "mk-field",
        status === "error" && "is-error",
        status === "success" && "is-success",
        className,
      )}
    >
      {(label != null || labelHint != null) && (
        <LabelTag className="mk-field-label" htmlFor={labelAsDiv ? undefined : htmlFor}>
          {label}
          {labelHint != null && <span className="mk-field-hint">{labelHint}</span>}
        </LabelTag>
      )}
      {children}
      {(helper != null || helperEnd != null) && (
        <div className="mk-helper">
          {status != null && <Triangle size={11} />}
          {helper}
          {helperEnd != null && <span className="mk-count">{helperEnd}</span>}
        </div>
      )}
    </div>
  );
}
