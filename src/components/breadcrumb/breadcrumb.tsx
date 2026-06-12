import * as React from "react";
import { cx } from "../../internal/cx";
import { Triangle } from "../triangle";

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** The last item renders as the current page. */
  items: BreadcrumbItem[];
}

/** Breadcrumb with Mosaik triangle separators pointing right. */
export function Breadcrumb({ items, className, ...rest }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cx("mk-crumb", className)} {...rest}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {isLast ? (
              <span className="current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <a href={item.href ?? "#"} onClick={item.onClick}>
                {item.label}
              </a>
            )}
            {!isLast && (
              <span className="sep" aria-hidden="true">
                <Triangle size={8} direction="right" />
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
