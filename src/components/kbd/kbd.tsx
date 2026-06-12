import * as React from "react";
import { cx } from "../../internal/cx";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

/** Keyboard shortcut chip, e.g. ⌘K. */
export function Kbd({ className, children, ...rest }: KbdProps) {
  return (
    <kbd className={cx("mk-kbd", className)} {...rest}>
      {children}
    </kbd>
  );
}
