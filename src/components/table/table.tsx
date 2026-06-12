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
}

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: TableColumn[];
  rows: TableRow[];
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
}

/**
 * Data table: sortable headers (triangle indicator), row selection
 * with select-all, hover and selected row tints.
 */
export function Table({
  columns,
  rows,
  sortKey,
  sortDirection = "desc",
  onSort,
  selectable = false,
  selected,
  defaultSelected,
  onSelectionChange,
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

  const allSelected = rows.length > 0 && sel.length === rows.length;
  const someSelected = sel.length > 0 && !allSelected;

  return (
    <div className={cx("mk-table-wrap", className)} {...rest}>
      <table className="mk-table">
        <thead>
          <tr>
            {selectable && (
              <th style={{ width: 36 }}>
                <Checkbox
                  aria-label="Select all"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={() => setSelection(allSelected ? [] : rows.map((r) => r.id))}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={cx(col.numeric && "num", col.sortable && "sortable")}
                style={col.width != null ? { width: col.width } : undefined}
                aria-sort={
                  col.key === sortKey
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
                onClick={col.sortable ? () => onSort?.(col.key) : undefined}
              >
                {col.label}
                {col.key === sortKey && (
                  <span className="sort">
                    <svg
                      width="8"
                      height="7"
                      viewBox="0 0 12 10"
                      aria-hidden="true"
                      style={sortDirection === "asc" ? { transform: "rotate(180deg)" } : undefined}
                    >
                      <path
                        d="M3.2 1.5 H8.8 Q11 1.5 9.78 3.33 L6 9 L2.22 3.33 Q1 1.5 3.2 1.5 Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSelected = sel.includes(row.id);
            return (
              <tr key={row.id} className={cx(isSelected && "is-selected")}>
                {selectable && (
                  <td>
                    <Checkbox
                      aria-label={`Select ${row.id}`}
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
                    {cell}
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
