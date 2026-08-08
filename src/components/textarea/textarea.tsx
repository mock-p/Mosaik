import * as React from "react";
import { cx } from "../../internal/cx";
import { FieldShell, type FieldStatus } from "../field";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  labelHint?: React.ReactNode;
  helper?: React.ReactNode;
  status?: FieldStatus;
  /** Show a "n / maxLength" counter in the helper row (needs `maxLength`). */
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      labelHint,
      helper,
      status,
      showCount = false,
      maxLength,
      id,
      className,
      value,
      defaultValue,
      "aria-describedby": ariaDescribedBy,
      onChange,
      ...rest
    },
    ref,
  ) {
    const autoId = React.useId();
    const textareaId = id ?? autoId;
    const [length, setLength] = React.useState(() => {
      const initial = value ?? defaultValue ?? "";
      return String(initial).length;
    });
    const currentLength = value != null ? String(value).length : length;
    const helperId = helper != null || (showCount && maxLength != null) ? `${textareaId}-helper` : undefined;
    const describedBy = [ariaDescribedBy, helperId].filter(Boolean).join(" ") || undefined;

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLength(event.target.value.length);
      onChange?.(event);
    };

    return (
      <FieldShell
        label={label}
        labelHint={labelHint}
        helper={helper}
        helperEnd={
          showCount && maxLength != null
            ? `${currentLength} / ${maxLength}`
            : undefined
        }
        status={status}
        htmlFor={textareaId}
        helperId={helperId}
        className={className}
      >
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          className={cx("mk-textarea")}
          aria-invalid={status === "error" || undefined}
          aria-describedby={describedBy}
          aria-errormessage={status === "error" ? helperId : undefined}
          onChange={handleChange}
          {...rest}
        />
      </FieldShell>
    );
  },
);
