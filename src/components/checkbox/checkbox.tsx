import * as React from "react";
import { cx } from "../../internal/cx";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  helper?: React.ReactNode;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { label, helper, indeterminate = false, className, ...rest },
    forwardedRef,
  ) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    return (
      <label className={cx("mk-checkbox", className)}>
        <input ref={inputRef} type="checkbox" {...rest} />
        <span className="mk-checkbox-box" />
        {(label != null || helper != null) && (
          <span className="mk-checkbox-label">
            {label}
            {helper != null && <span className="mk-checkbox-helper">{helper}</span>}
          </span>
        )}
      </label>
    );
  },
);
