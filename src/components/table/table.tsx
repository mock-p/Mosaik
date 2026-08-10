import * as React from "react";
import { cx } from "../../internal/cx";
import { Checkbox } from "../checkbox";

export interface TableColumn {
  key: string;
  label?: React.ReactNode;
  sortable?: boolean;
  /** Right-aligned tabular numbers. */
  numeric?: boolean;
  width?: number | string;
}

export interface TableRow {
  id: string;
  /** One cell per column, in column order. */
  cells: React.ReactNode[];
  /** Makes the row navigable through an accessible link in its first data cell. */
  rowHref?: string;
  /** Accessible name for the row link. Defaults to the first textual cell. */
  rowLabel?: string;
}

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: TableColumn[];
  rows: TableRow[];
  /** Optional accessible table caption. */
  caption?: React.ReactNode;
  /** Visually hide the caption while keeping it available to assistive tech. */
  captionHidden?: boolean;
  /** Key of the sorted column — shows the Mosaik triangle indicator. */
  sortKey?: string;
  /** @default "desc" */
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  /** Adds the checkbox column with select-all in the header. */
  selectable?: boolean;
  selected?: string[];
  defaultSelected?: string[];
  onSelectionChange?: (ids: string[]) => void;
  selectAllLabel?: string;
  selectionLabel?: (row: TableRow) => string;
  onRowActivate?: (row: TableRow, event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Data table: sortable headers (triangle indicator), row selection
 * with select-all, hover and selected row tints.
 */
export function Table({
  columns,
  rows,
  caption,
  captionHidden = false,
  sortKey,
  sortDirection = "desc",
  onSort,
  selectable = false,
  selected,
  defaultSelected,
  onSelectionChange,
  selectAllLabel = "Select all rows",
  selectionLabel = (row) => `Select ${row.id}`,
  onRowActivate,
  className,
  ...rest
}: TableProps) {
  const [internal, setInternal] = React.useState<string[]>(
    () => defaultSelected ?? [],
  );
  const sel = selected ?? internal;

  const setSelection = (ids: string[]) => {
    if (selected === undefined) setInternal(ids);
    onSelectionChange?.(ids);
  };

  const rowIds = rows.map((row) => row.id);
  const selectedOnPage = rowIds.filter((id) => sel.includes(id));
  const allSelected = rows.length > 0 && selectedOnPage.length === rows.length;
  const someSelected = selectedOnPage.length > 0 && !allSelected;

  return (
    <div className={cx("mk-table-wrap", className)} {...rest}>
      <table className="mk-table">
        {caption != null && (
          <caption className={cx(captionHidden && "mk-sr-only")}>{caption}</caption>
        )}
        <thead>
          <tr>
            {selectable && (
              <th scope="col" style={{ width: 36 }}>
                <Checkbox
                  aria-label={selectAllLabel}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={() =>
                    setSelection(
                      allSelected
                        ? sel.filter((id) => !rowIds.includes(id))
                        : Array.from(new Set([...sel, ...rowIds])),
                    )
                  }
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cx(col.numeric && "num", col.sortable && "sortable")}
                style={col.width != null ? { width: col.width } : undefined}
                aria-sort={
                  col.sortable
                    ? col.key === sortKey
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
              >
                {col.sortable ? (
                  <button
                    type="button"
                    className="mk-table-sort-button"
                    disabled={onSort == null}
                    onClick={() => onSort?.(col.key)}
                  >
                    {col.label}
                    {col.key === sortKey && (
                      <span className="sort">
                        <svg
                          width="8"
                          height="7"
                          viewBox="0 0 12 10"
                          aria-hidden="true"
                          style={
                            sortDirection === "asc" ? { transform: "rotate(180deg)" } : undefined
                          }
                        >
                          <path
                            d="M3.2 1.5 H8.8 Q11 1.5 9.78 3.33 L6 9 L2.22 3.33 Q1 1.5 3.2 1.5 Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSelected = sel.includes(row.id);
            return (
              <tr
                key={row.id}
                className={cx(isSelected && "is-selected", row.rowHref && "is-interactive")}
              >
                {selectable && (
                  <td>
                    <Checkbox
                      aria-label={selectionLabel(row)}
                      checked={isSelected}
                      onChange={() =>
                        setSelection(
                          isSelected ? sel.filter((id) => id !== row.id) : [...sel, row.id],
                        )
                      }
                    />
                  </td>
                )}
                {row.cells.map((cell, i) => (
                  <td key={i} className={cx(columns[i]?.numeric && "num")}>
                    {i === 0 && row.rowHref ? (
                      <a
                        className="mk-table-row-link"
                        href={row.rowHref}
                        aria-label={row.rowLabel}
                        onClick={(event) => onRowActivate?.(row, event)}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") return;
                          event.preventDefault();
                          event.currentTarget.click();
                        }}
                      >
                        {cell}
                      </a>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
