import * as React from "react";
import { cx } from "../../internal/cx";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
}

const RemoveIcon = (
  <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
    <path
      d="M1 1l6 6M7 1L1 7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    active = false,
    removable = true,
    onRemove,
    removeLabel,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx("mk-tag", active && "is-active", !removable && "no-x", className)}
      {...rest}
    >
      {children}
      {removable && (
        <button
          type="button"
          className="mk-tag-x"
          aria-label={removeLabel ?? `Remove ${String(children)}`}
          onClick={onRemove}
        >
          {RemoveIcon}
        </button>
      )}
    </span>
  );
});
