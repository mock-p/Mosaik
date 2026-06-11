import * as React from "react";
import { cx } from "../../internal/cx";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Text rendered next to the toggle. */
  label?: React.ReactNode;
}

/**
 * Toggle switch — track and thumb both carry the Mosaik corner motif.
 * The thumb keeps its corner orientation; only its position slides.
 */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ label, className, ...rest }, ref) {
    return (
      <label className={cx("mk-switch", className)}>
        <input ref={ref} type="checkbox" {...rest} />
        <span className="mk-track">
          <span className="mk-thumb" />
        </span>
        {label != null && <span className="mk-switch-label">{label}</span>}
      </label>
    );
  },
);
