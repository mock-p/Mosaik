import * as React from "react";
import { cx } from "../../internal/cx";

export interface DropzoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onDrop"> {
  /** Headline — wrap the browse word in `<em>` for the accent color. */
  title?: React.ReactNode;
  /** Constraint hint, e.g. "JSON ou YAML · 2 Mo max". */
  hint?: React.ReactNode;
  /** Replaces the default upload arrow icon. */
  icon?: React.ReactNode;
  /** Called with dropped or browsed files. */
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

const UploadIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M8 11 V3 M4.8 6 L8 2.8 L11.2 6"
      stroke="currentColor"
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M3 13.2 h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

/** Dashed dropzone — Mosaik corners, drag-over highlight, hidden file input. */
export function Dropzone({
  title,
  hint,
  icon,
  onFiles,
  accept,
  multiple = false,
  className,
  ...rest
}: DropzoneProps) {
  const [dragover, setDragover] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const emit = (list: FileList | null) => {
    if (list && list.length > 0) onFiles?.(Array.from(list));
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cx("mk-drop", dragover && "dragover", className)}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragover(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragover(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragover(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragover(false);
        emit(event.dataTransfer.files);
      }}
      {...rest}
    >
      <span className="mk-drop-icon">{icon ?? UploadIcon}</span>
      {title != null && <div className="mk-drop-title">{title}</div>}
      {hint != null && <div className="mk-drop-hint">{hint}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(event) => {
          emit(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export interface FileItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: React.ReactNode;
  /** Size / status line, e.g. "14 Ko · importé". */
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  /** End slot — `Badge`, `Progress`, remove button… */
  end?: React.ReactNode;
}

/** Imported-file row shown under a dropzone. */
export function FileItem({ name, meta, icon, end, className, ...rest }: FileItemProps) {
  return (
    <div className={cx("mk-file", className)} {...rest}>
      <span className="mk-file-icon">
        {icon ?? (
          <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 2.5 L12.25 9.84 Q13.5 12 11 12 H5 Q2.5 12 3.75 9.84 Z" fill="currentColor" />
          </svg>
        )}
      </span>
      <span className="mk-file-id">
        <div className="mk-file-name">{name}</div>
        {meta != null && <div className="mk-file-size">{meta}</div>}
      </span>
      {end}
    </div>
  );
}
