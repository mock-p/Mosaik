import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./components/badge";
import { Button } from "./components/button";
import { Card } from "./components/card";
import { Checkbox } from "./components/checkbox";
import { Radio } from "./components/radio";
import { Select } from "./components/select";
import { Switch } from "./components/switch";
import { Tag } from "./components/tag";
import { TextField } from "./components/text-field";
import { Textarea } from "./components/textarea";
import { Triangle } from "./components/triangle";

const PlusIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path
      d="M7 2.5v9M2.5 7h9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const rowLabel: React.CSSProperties = {
  fontFamily: "var(--mk-font-ui)",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--mk-muted)",
  margin: "28px 0 12px",
};
const row: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 12,
};
const cap: React.CSSProperties = {
  fontSize: 11,
  color: "var(--mk-muted)",
  fontFamily: "var(--mk-font-ui)",
  letterSpacing: ".04em",
};
const secHead: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 12,
  margin: "48px 0 18px",
};
const secNum: React.CSSProperties = {
  fontFamily: "var(--mk-font-display)",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--mk-primary)",
  letterSpacing: ".08em",
};
const secTitle: React.CSSProperties = {
  fontFamily: "var(--mk-font-display)",
  fontSize: 19,
  fontWeight: 600,
  margin: 0,
};

function Spec({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      {children}
      <span style={cap}>{caption}</span>
    </div>
  );
}

function PageHead() {
  return (
    <>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 14,
        }}
      >
        <div
          style={{ position: "relative", width: 44, height: 40, flex: "none" }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 30,
              height: 30,
              background: "var(--mk-primary)",
              borderRadius:
                "calc(var(--mk-c1) * .65) var(--mk-c2) calc(var(--mk-c1) * .65) var(--mk-c2)",
            }}
          />
          <Triangle
            size={22}
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              color: "#FF6E64",
            }}
          />
        </div>
        <div>
          <h1
            style={{
              fontFamily: "var(--mk-font-display)",
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-.01em",
              margin: 0,
            }}
          >
            Buttons &amp; Inputs
          </h1>
          <div style={{ fontSize: 13, color: "var(--mk-muted)", marginTop: 2 }}>
            Mosaik · 01
          </div>
        </div>
      </header>
      <p
        style={{
          fontSize: 14.5,
          color: "var(--mk-muted)",
          maxWidth: "62ch",
          margin: 0,
        }}
      >
        Core controls built on the two project shapes — the square with two
        opposite rounded corners, and the triangle with two rounded corners and
        one sharp tip. The triangle does functional work: select chevron,
        loading spinner, helper-text markers.
      </p>
    </>
  );
}

function ButtonsPanel() {
  return (
    <div className="mk-panel">
      <div style={{ ...rowLabel, marginTop: 0 }}>Variants</div>
      <div style={row}>
        <Button variant="primary">Publish plugin</Button>
        <Button variant="secondary">Try it live</Button>
        <Button variant="tonal">Duplicate</Button>
        <Button variant="outline">Settings</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="danger">Delete</Button>
      </div>

      <div style={rowLabel}>Sizes</div>
      <div style={row}>
        <Button size="sm">Save draft</Button>
        <Button size="md">Save draft</Button>
        <Button size="lg">Save draft</Button>
      </div>

      <div style={rowLabel}>With icon · icon-only · loading</div>
      <div style={row}>
        <Button icon={<Triangle size={13} direction="right" />}>Run</Button>
        <Button variant="tonal" icon={PlusIcon}>
          New block
        </Button>
        <Button variant="outline" iconOnly icon={PlusIcon} aria-label="Add" />
        <Button loading>Publishing…</Button>
      </div>

      <div style={rowLabel}>States</div>
      <div style={row}>
        <Spec caption="hover">
          <Button className="is-hover">Publish</Button>
        </Spec>
        <Spec caption="focus">
          <Button className="is-focus">Publish</Button>
        </Spec>
        <Spec caption="pressed">
          <Button className="is-active">Publish</Button>
        </Spec>
        <Spec caption="disabled">
          <Button disabled>Publish</Button>
        </Spec>
      </div>
    </div>
  );
}

function InputsPanel() {
  return (
    <div className="mk-panel">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "22px 20px",
        }}
      >
        <TextField
          label="Plugin name"
          placeholder="e.g. Auto-tagger"
          helper="Shown publicly in the plugin gallery."
        />
        <Select
          label="Target app"
          labelHint="Required"
          options={["Notion", "Figma", "Slack", "Airtable", "Linear"]}
          defaultValue="Notion"
          placeholder="Choose an app…"
          helper="Where this plugin will run."
        />
        <TextField
          label="Slug"
          defaultValue="auto tagger!"
          status="error"
          helper="Lowercase letters and dashes only."
        />
        <TextField
          label="API key"
          defaultValue="pk_live_4xT…9q2"
          status="success"
          helper="Key verified — connected to workspace."
        />
        <Select
          className="span-all"
          label="Compatible apps"
          labelHint="Multi-select"
          multiple
          options={["Notion", "Figma", "Slack", "Airtable", "Linear", "GitHub"]}
          defaultValue={["Notion", "Slack"]}
          placeholder="Select apps…"
          helper="Apps where the plugin can also be installed."
        />
        <Textarea
          className="span-all"
          label="Description"
          labelHint="Optional"
          placeholder="What does this plugin do?"
          helper="Markdown supported."
          maxLength={280}
          showCount
        />
      </div>

      <div style={{ ...rowLabel, marginTop: 28 }}>Toggles</div>
      <div style={{ ...row, gap: 28 }}>
        <Switch label="Public listing" />
        <Switch label="Auto-update" defaultChecked />
        <Switch label="Sandboxed" defaultChecked disabled />
      </div>

      <style>{`.span-all { grid-column: 1 / -1; }`}</style>
    </div>
  );
}

function ControlsPanel() {
  return (
    <div className="mk-panel">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ ...rowLabel, marginTop: 0 }}>Checkbox</div>
          <div style={{ display: "grid", gap: 14, justifyItems: "start" }}>
            <Checkbox label="Email notifications" />
            <Checkbox label="Auto-publish updates" defaultChecked />
            <Checkbox label="All permissions" indeterminate />
            <Checkbox
              label="Marketplace listing"
              helper="Visible to all users in the gallery."
              defaultChecked
            />
            <Checkbox label="Required scope" defaultChecked disabled />
          </div>
        </div>
        <div>
          <div style={{ ...rowLabel, marginTop: 0 }}>Radio</div>
          <div style={{ display: "grid", gap: 14, justifyItems: "start" }}>
            <Radio name="pricing-overview" label="Free" />
            <Radio
              name="pricing-overview"
              label="One-time purchase"
              defaultChecked
            />
            <Radio name="pricing-overview" label="Subscription" />
            <Radio name="pricing-overview" label="Enterprise (soon)" disabled />
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgesTagsPanel() {
  return (
    <div className="mk-panel">
      <div style={{ ...rowLabel, marginTop: 0 }}>Badges</div>
      <div style={row}>
        <Badge variant="success">Published</Badge>
        <Badge variant="neutral">Draft</Badge>
        <Badge variant="info">Beta</Badge>
        <Badge variant="featured" icon={<Triangle size={9} />}>
          Featured
        </Badge>
        <Badge variant="danger">Deprecated</Badge>
      </div>

      <div style={rowLabel}>Tags</div>
      <div style={row}>
        <Tag>notion</Tag>
        <Tag>automation</Tag>
        <Tag active>productivity</Tag>
        <Tag removable={false}>v2.4.1</Tag>
      </div>
    </div>
  );
}

function CardsPanel() {
  return (
    <div className="mk-panel">
      <div style={{ ...rowLabel, marginTop: 0 }}>Plugin cards</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        <Card
          title="Auto-tagger"
          author="par Lena K."
          description="Classe automatiquement vos pages Notion avec des tags générés à partir du contenu."
          icon={<Triangle size={18} />}
          badge={<Badge variant="success">Published</Badge>}
          action={
            <Button variant="tonal" size="sm">
              Install
            </Button>
          }
        />
        <Card
          title="Linear ↔ Slack Sync"
          author="par Tomas R."
          description="Synchronise les issues Linear avec vos canaux Slack, dans les deux sens."
          icon={<Triangle size={18} direction="right" />}
          iconTone="coral"
          badge={<Badge variant="info">Beta</Badge>}
          action={
            <Button variant="primary" size="sm">
              Install
            </Button>
          }
        />
      </div>

      <div style={rowLabel}>List variant</div>
      <Card
        row
        title="Markdown Export"
        author="par vous · modifié il y a 2 j"
        icon={PlusIcon}
        badge={<Badge variant="neutral">Draft</Badge>}
        action={
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      />
    </div>
  );
}

const meta = {
  title: "Mosaik/All components",
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => (
    <div style={{ maxWidth: 1080 }}>
      <PageHead />
      <section>
        <div style={secHead}>
          <span style={secNum}>01</span>
          <h2 style={secTitle}>Buttons</h2>
        </div>
        <ButtonsPanel />
      </section>
      <section>
        <div style={secHead}>
          <span style={secNum}>02</span>
          <h2 style={secTitle}>Inputs</h2>
        </div>
        <InputsPanel />
      </section>
      <section>
        <div style={secHead}>
          <span style={secNum}>03</span>
          <h2 style={secTitle}>Checkbox &amp; Radio</h2>
        </div>
        <ControlsPanel />
      </section>
      <section>
        <div style={secHead}>
          <span style={secNum}>04</span>
          <h2 style={secTitle}>Badges &amp; Tags</h2>
        </div>
        <BadgesTagsPanel />
      </section>
      <section>
        <div style={secHead}>
          <span style={secNum}>05</span>
          <h2 style={secTitle}>Cards</h2>
        </div>
        <CardsPanel />
      </section>
    </div>
  ),
};
