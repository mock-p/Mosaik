import * as React from "react";
import { cx } from "../../internal/cx";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  helper?: React.ReactNode;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ label, helper, className, ...rest }, ref) {
    return (
      <label className={cx("mk-radio", className)}>
        <input ref={ref} type="radio" {...rest} />
        <span className="mk-radio-ring" />
        {(label != null || helper != null) && (
          <span className="mk-radio-label">
            {label}
            {helper != null && <span className="mk-radio-helper">{helper}</span>}
          </span>
        )}
      </label>
    );
  },
);
