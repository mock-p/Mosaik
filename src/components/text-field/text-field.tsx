import * as React from "react";
import { cx } from "../../internal/cx";
import { FieldShell, type FieldStatus } from "../field";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  labelHint?: React.ReactNode;
  helper?: React.ReactNode;
  status?: FieldStatus;
  /** Glyph inside the field, left side — turns primary on focus. */
  iconStart?: React.ReactNode;
  /** Slot inside the field, right side — e.g. `<Kbd>⌘K</Kbd>`. */
  iconEnd?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, labelHint, helper, status, iconStart, iconEnd, id, className, ...rest },
    ref,
  ) {
    const autoId = React.useId();
    const inputId = id ?? autoId;

    const input = (
      <input
        ref={ref}
        id={inputId}
        type="text"
        className="mk-input"
        aria-invalid={status === "error" || undefined}
        {...rest}
      />
    );

    return (
      <FieldShell
        label={label}
        labelHint={labelHint}
        helper={helper}
        status={status}
        htmlFor={inputId}
        className={className}
      >
        {iconStart == null && iconEnd == null ? (
          input
        ) : (
          <div
            className={cx(
              "mk-input-wrap",
              iconStart != null && "has-start",
              iconEnd != null && "has-end",
            )}
          >
            {input}
            {iconStart != null && <span className="mk-input-start">{iconStart}</span>}
            {iconEnd != null && <span className="mk-input-end">{iconEnd}</span>}
          </div>
        )}
      </FieldShell>
    );
  },
);
