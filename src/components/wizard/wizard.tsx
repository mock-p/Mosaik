import * as React from "react";
import { cx } from "../../internal/cx";
import { CheckGlyph } from "../../internal/glyphs";

export interface WizardStep {
  label: React.ReactNode;
}

export interface WizardProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: WizardStep[];
  /** 0-based index of the current step; earlier steps show a check. */
  current?: number;
}

/** Publication wizard — numbered Mosaik dots joined by connectors. */
export function Wizard({ steps, current = 0, className, ...rest }: WizardProps) {
  return (
    <div className={cx("mk-wiz", className)} {...rest}>
      {steps.map((step, i) => (
        <div
          key={i}
          className={cx(
            "mk-wiz-step",
            i < current && "done",
            i === current && "current",
          )}
          aria-current={i === current ? "step" : undefined}
        >
          <span className="mk-wiz-dot">
            {i < current ? <CheckGlyph size={11} strokeWidth={2.2} /> : i + 1}
          </span>
          <span className="mk-wiz-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
}
