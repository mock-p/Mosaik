import * as React from "react";
import { cx } from "../../internal/cx";

export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Header label, e.g. the file name. */
  title?: React.ReactNode;
  /** Plain-text source; also what the copy button copies. */
  code: string;
  /** @default true */
  lineNumbers?: boolean;
  /** Custom line rendering for syntax coloring (`tk-key` / `tk-str` spans). */
  renderLine?: (line: string, index: number) => React.ReactNode;
  /** @default "Copier" */
  copyLabel?: string;
  /** @default "Copié !" */
  copiedLabel?: string;
}

/** Inverse-surface code block with line numbers and a copy button. */
export function CodeBlock({
  title,
  code,
  lineNumbers = true,
  renderLine,
  copyLabel = "Copier",
  copiedLabel = "Copié !",
  className,
  ...rest
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const lines = code.split("\n");

  return (
    <div className={cx("mk-code", className)} {...rest}>
      <div className="mk-code-head">
        {title}
        <button
          className="mk-code-copy"
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(code);
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 1400);
          }}
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre>
        {lines.map((line, i) => (
          <span key={i} className="cl">
            {lineNumbers && <span className="ln">{i + 1}</span>}
            {renderLine ? renderLine(line, i) : line}
          </span>
        ))}
      </pre>
    </div>
  );
}

export interface InlineCodeProps extends React.HTMLAttributes<HTMLElement> {}

/** Inline code chip. */
export function InlineCode({ className, children, ...rest }: InlineCodeProps) {
  return (
    <code className={cx("mk-icode", className)} {...rest}>
      {children}
    </code>
  );
}
