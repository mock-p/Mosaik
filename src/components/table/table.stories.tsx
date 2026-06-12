import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../badge";
import { Avatar } from "../avatar";
import { Table, type TableColumn, type TableRow } from "./table";

const COLUMNS: TableColumn[] = [
  { key: "plugin", label: "Plugin", sortable: true },
  { key: "status", label: "Statut" },
  { key: "version", label: "Version" },
  { key: "runs", label: "Exécutions", sortable: true, numeric: true },
  { key: "updated", label: "Mis à jour" },
];

function cellMain(
  initials: string,
  tone: "default" | "coral" | "solid",
  title: string,
  author: string,
) {
  return (
    <span className="cell-main">
      <Avatar size="sm" tone={tone}>
        {initials}
      </Avatar>
      <span>
        <span className="t">{title}</span>
        <br />
        <span className="s">{author}</span>
      </span>
    </span>
  );
}

const ROWS: TableRow[] = [
  {
    id: "auto-tagger",
    cells: [
      cellMain("AT", "default", "Auto-tagger", "Alix Laurent"),
      <Badge variant="success">Published</Badge>,
      <span className="muted">2.4.1</span>,
      "48 210",
      <span className="muted">Il y a 2 h</span>,
    ],
  },
  {
    id: "slack-notifier",
    cells: [
      cellMain("SN", "coral", "Slack notifier", "June Roy"),
      <Badge variant="info">Draft</Badge>,
      <span className="muted">0.9.0</span>,
      "1 037",
      <span className="muted">Hier</span>,
    ],
  },
  {
    id: "figma-sync",
    cells: [
      cellMain("FS", "solid", "Figma sync", "Marc Kha"),
      <Badge variant="danger">Deprecated</Badge>,
      <span className="muted">1.2.8</span>,
      "312 940",
      <span className="muted">12 mai</span>,
    ],
  },
];

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
  args: {
    columns: COLUMNS,
    rows: ROWS,
    selectable: true,
    sortKey: "plugin",
    sortDirection: "desc",
    defaultSelected: ["slack-notifier"],
  },
  argTypes: {
    sortDirection: { control: "inline-radio", options: ["asc", "desc"] },
    selectable: { control: "boolean" },
    columns: { control: false },
    rows: { control: false },
    selected: { control: false },
    onSort: { control: false },
    onSelectionChange: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function SortableDemo() {
  const [sortKey, setSortKey] = React.useState("runs");
  const [dir, setDir] = React.useState<"asc" | "desc">("desc");
  return (
    <Table
      columns={COLUMNS}
      rows={ROWS}
      selectable
      sortKey={sortKey}
      sortDirection={dir}
      onSort={(key) => {
        if (key === sortKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
        else setSortKey(key);
      }}
    />
  );
}

export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  render: () => <SortableDemo />,
};
