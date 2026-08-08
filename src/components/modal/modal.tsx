import * as React from "react";
import { createPortal } from "react-dom";
import { cx } from "../../internal/cx";
import { focusFirst, lockBodyScroll, trapTabKey } from "../../internal/focus";
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
  /** Shows the close button / closes on Escape and backdrop click. */
  onClose?: () => void;
  /** Accessible label for the close button. @default "Close" */
  closeLabel?: string;
  /** Element focused when the dialog opens; defaults to the first focusable item. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Render the viewport overlay into `document.body`. @default true */
  portal?: boolean;
  /** Render in-flow on a tinted demo stage instead of a modal overlay. */
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
    closeLabel = "Close",
    initialFocusRef,
    portal = true,
    inline = false,
    className,
    children,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  forwardedRef,
) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => dialogRef.current as HTMLDivElement);
  const reactId = React.useId();
  const titleId = `${reactId}-title`;
  const descriptionId = children != null ? `${reactId}-description` : undefined;
  const [portalReady, setPortalReady] = React.useState(false);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => setPortalReady(true), []);

  React.useEffect(() => {
    if (!open || inline || (portal && !portalReady)) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const unlock = lockBodyScroll();
    const frame = requestAnimationFrame(() => focusFirst(dialog, initialFocusRef?.current));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onCloseRef.current != null) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      trapTabKey(event, dialog);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      unlock();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open, inline, portal, portalReady, initialFocusRef]);

  if (!open) return null;

  const dialog = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal={!inline || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel == null && title != null ? titleId : undefined}
      aria-describedby={ariaDescribedBy ?? descriptionId}
      tabIndex={-1}
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
            <button className="mk-dialog-x" type="button" aria-label={closeLabel} onClick={onClose}>
              <CrossGlyph />
            </button>
          )}
        </div>
      )}
      <div className="mk-dialog-body">
        {title != null && (
          <div id={titleId} className="mk-dialog-title">
            {title}
          </div>
        )}
        {children != null && (
          <div id={descriptionId} className="mk-dialog-text">
            {children}
          </div>
        )}
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

  const overlay = (
    <div
      className="mk-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      {dialog}
    </div>
  );

  if (!portal) return overlay;
  return portalReady ? createPortal(overlay, document.body) : null;
});
