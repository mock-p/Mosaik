import * as React from "react";
import { cx } from "../../internal/cx";
import { CheckGlyph, CrossGlyph } from "../../internal/glyphs";
import { Triangle } from "../triangle";

export type ModalVariant = "danger" | "primary" | "success" | "neutral";

export interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Hides the modal entirely when false. @default true */
  open?: boolean;
  /** Semantic tone of the meta label. @default "neutral" */
  variant?: ModalVariant;
  /** Uppercase meta-bar label, e.g. "Danger zone · Auto-tagger". */
  metaLabel?: React.ReactNode;
  /** Replaces the default semantic meta glyph. */
  metaIcon?: React.ReactNode;
  title?: React.ReactNode;
  /** Monospace details block — pass `<span>` items. */
  details?: React.ReactNode;
  /** Muted note on the left of the footer. */
  footNote?: React.ReactNode;
  /** Footer actions, right-aligned. */
  actions?: React.ReactNode;
  /** Shows the × button / closes on Escape and backdrop click. */
  onClose?: () => void;
  /**
   * Render in-flow on a tinted demo stage instead of a
   * fixed full-screen overlay. @default false
   */
  inline?: boolean;
}

const DEFAULT_META_ICON: Record<ModalVariant, React.ReactNode> = {
  danger: <Triangle size={11} />,
  primary: <Triangle size={11} direction="right" />,
  success: <CheckGlyph size={11} strokeWidth={2.2} />,
  neutral: <Triangle size={11} />,
};

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open = true,
    variant = "neutral",
    metaLabel,
    metaIcon,
    title,
    details,
    footNote,
    actions,
    onClose,
    inline = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  React.useEffect(() => {
    if (!open || inline || onClose == null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, inline, onClose]);

  if (!open) return null;

  const dialog = (
    <div
      ref={ref}
      role="dialog"
      aria-modal={!inline || undefined}
      className={cx("mk-dialog", variant !== "neutral" && `is-${variant}`, className)}
      {...rest}
    >
      {(metaLabel != null || onClose != null) && (
        <div className="mk-dialog-meta">
          <span className="label">
            {metaIcon ?? (metaLabel != null ? DEFAULT_META_ICON[variant] : null)}
            {metaLabel}
          </span>
          {onClose != null && (
            <button className="mk-dialog-x" type="button" aria-label="Close" onClick={onClose}>
              <CrossGlyph />
            </button>
          )}
        </div>
      )}
      <div className="mk-dialog-body">
        {title != null && <div className="mk-dialog-title">{title}</div>}
        {children != null && <p className="mk-dialog-text">{children}</p>}
        {details != null && <div className="mk-dialog-details">{details}</div>}
      </div>
      {(footNote != null || actions != null) && (
        <div className="mk-dialog-foot">
          <span className="note">{footNote}</span>
          {actions != null && <span className="acts">{actions}</span>}
        </div>
      )}
    </div>
  );

  if (inline) return <div className="mk-modal-stage">{dialog}</div>;

  return (
    <div
      className="mk-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      {dialog}
    </div>
  );
});
