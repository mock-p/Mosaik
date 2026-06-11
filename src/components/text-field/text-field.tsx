import * as React from "react";
import { cx } from "../../internal/cx";
import { FieldShell, type FieldStatus } from "../field";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  labelHint?: React.ReactNode;
  helper?: React.ReactNode;
  status?: FieldStatus;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, labelHint, helper, status, id, className, ...rest },
    ref,
  ) {
    const autoId = React.useId();
    const inputId = id ?? autoId;

    return (
      <FieldShell
        label={label}
        labelHint={labelHint}
        helper={helper}
        status={status}
        htmlFor={inputId}
        className={className}
      >
        <input
          ref={ref}
          id={inputId}
          type="text"
          className={cx("mk-input")}
          aria-invalid={status === "error" || undefined}
          {...rest}
        />
      </FieldShell>
    );
  },
);
