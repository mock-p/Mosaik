import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "./components/accordion";
import { ActionMenu } from "./components/action-menu";
import { Alert } from "./components/alert";
import { Avatar, AvatarStack } from "./components/avatar";
import { Badge } from "./components/badge";
import { Banner } from "./components/banner";
import { Breadcrumb } from "./components/breadcrumb";
import { CodeBlock, InlineCode } from "./components/code-block";
import { CommandPalette } from "./components/command-palette";
import { Drawer } from "./components/drawer";
import { Dropzone, FileItem } from "./components/dropzone";
import { EmptyState } from "./components/empty-state";
import { Kbd } from "./components/kbd";
import { Progress, Spinner } from "./components/progress";
import { Skeleton } from "./components/skeleton";
import { Slider } from "./components/slider";
import { Stepper } from "./components/stepper";
import { Table } from "./components/table";
import { Wizard } from "./components/wizard";
import { Button } from "./components/button";
import { Card } from "./components/card";
import { Checkbox } from "./components/checkbox";
import { FloatingButton, FloatingLayer } from "./components/floating-layer";
import { Modal } from "./components/modal";
import { Pagination } from "./components/pagination";
import { Radio } from "./components/radio";
import { SegmentedControl } from "./components/segmented-control";
import { Select } from "./components/select";
import { Switch } from "./components/switch";
import { Tabs } from "./components/tabs";
import { Tag } from "./components/tag";
import { TextField } from "./components/text-field";
import { Textarea } from "./components/textarea";
import { Toast, ToastZone, useToasts } from "./components/toast";
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
      <div className="mk-overview-input-grid">
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
      <div className="mk-overview-two-col">
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
      <div className="mk-overview-card-grid">
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

function ContainersPanel() {
  return (
    <div className="mk-panel">
      <div style={{ ...rowLabel, marginTop: 0 }}>
        Modal — structure technique
      </div>
      <Modal
        inline
        variant="danger"
        metaLabel="Danger zone · Auto-tagger"
        title="Delete this plugin?"
        footNote="Cette action est irréversible."
        details={
          <>
            <span>
              <strong>1 240</strong> installs
            </span>
            <span>
              v<strong>2.4.1</strong>
            </span>
            <span>
              marketplace · <strong>public</strong>
            </span>
          </>
        }
        actions={
          <>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
            <Button variant="danger" size="sm">
              Delete
            </Button>
          </>
        }
        onClose={() => {}}
      >
        « Auto-tagger » sera retiré de la marketplace et désinstallé chez 1 240
        utilisateurs.
      </Modal>

      <div style={rowLabel}>Couche flottante — tooltip & popover unifiés</div>
      <div style={{ ...row, gap: 44, alignItems: "flex-end" }}>
        <Spec caption="tooltip · top">
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <FloatingLayer placement="top">Run this plugin</FloatingLayer>
            <Button
              variant="outline"
              iconOnly
              icon={<Triangle size={13} direction="right" />}
              aria-label="Run"
            />
          </div>
        </Spec>
        <Spec caption="titre + texte · top">
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <FloatingLayer placement="top" title="Sandboxed">
              Le plugin s'exécute isolé, sans accès réseau sortant.
            </FloatingLayer>
            <Button
              variant="outline"
              iconOnly
              icon={<Triangle size={13} />}
              aria-label="Info"
            />
          </div>
        </Spec>
        <Spec caption="+ actions · right">
          <div
            style={{ display: "inline-flex", alignItems: "center", gap: 12 }}
          >
            <Button variant="tonal" size="sm">
              Share
            </Button>
            <FloatingLayer
              placement="right"
              title="Share this plugin"
              actions={
                <>
                  <FloatingButton>Settings</FloatingButton>
                  <FloatingButton variant="primary">Copy link</FloatingButton>
                </>
              }
            >
              Toute personne disposant du lien pourra installer la version
              publiée.
            </FloatingLayer>
          </div>
        </Spec>
      </div>
    </div>
  );
}

function FeedbackPanel() {
  const { toasts, push, dismiss } = useToasts();
  return (
    <div className="mk-panel">
      <div style={{ ...rowLabel, marginTop: 0 }}>Alertes inline</div>
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        <Alert
          variant="info"
          title="Nouvelle version disponible"
          onDismiss={() => {}}
        >
          Mosaik SDK 3.2 apporte les déclencheurs planifiés.
        </Alert>
        <Alert variant="success" title="Clé API vérifiée">
          Votre workspace est connecté.
        </Alert>
        <Alert variant="warning" title="Quota presque atteint">
          92 % des exécutions mensuelles utilisées.
        </Alert>
        <Alert variant="danger" title="Build échoué" onDismiss={() => {}}>
          Le manifest contient une erreur de syntaxe.
        </Alert>
      </div>

      <div style={rowLabel}>Toasts — déclenchez-les</div>
      <div style={{ ...row, marginBottom: 14 }}>
        <Button
          variant="tonal"
          size="sm"
          onClick={() =>
            push("success", {
              title: "Plugin published",
              text: "Auto-tagger v2.4.1 est en ligne.",
            })
          }
        >
          Success
        </Button>
        <Button
          variant="tonal"
          size="sm"
          onClick={() =>
            push("info", {
              title: "Build started",
              text: "Compilation du plugin en cours…",
            })
          }
        >
          Info
        </Button>
        <Button
          variant="tonal"
          size="sm"
          onClick={() =>
            push("warning", {
              title: "Quota presque atteint",
              text: "92 % des exécutions utilisées.",
            })
          }
        >
          Warning
        </Button>
        <Button
          variant="tonal"
          size="sm"
          onClick={() =>
            push("error", {
              title: "Publication échouée",
              text: "Le manifest contient une erreur.",
            })
          }
        >
          Error
        </Button>
      </div>
      <div
        style={{
          position: "relative",
          height: 300,
          background: "var(--mk-surface-2)",
          borderRadius: "var(--mk-c1) var(--mk-c2) var(--mk-c1) var(--mk-c2)",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12.5,
            color: "var(--mk-muted)",
            pointerEvents: "none",
          }}
        >
          Les toasts apparaissent ici
        </span>
        <ToastZone>
          {toasts.map((t) => (
            <Toast
              key={t.id}
              kind={t.kind}
              title={t.title}
              leaving={t.leaving}
              onDismiss={() => dismiss(t.id)}
            >
              {t.text}
            </Toast>
          ))}
        </ToastZone>
      </div>
    </div>
  );
}

function NavigationPanel() {
  return (
    <div className="mk-panel">
      <div style={{ ...rowLabel, marginTop: 0 }}>Tabs</div>
      <Tabs
        items={[
          { value: "overview", label: "Overview" },
          { value: "builder", label: "Builder" },
          { value: "logs", label: "Logs", count: 3 },
          { value: "settings", label: "Settings" },
        ]}
        defaultValue="overview"
      />

      <div style={rowLabel}>Segmented control</div>
      <SegmentedControl
        options={["Éditeur", "Aperçu", "Code"]}
        aria-label="Mode"
      />

      <div style={rowLabel}>Menu d'actions</div>
      <div style={{ minHeight: 235, maxWidth: 430 }}>
        <Card
          row
          title="Auto-tagger"
          author="v2.4.1 · published"
          icon={<Triangle size={16} />}
          action={
            <ActionMenu
              items={[
                {
                  label: "Run",
                  icon: <Triangle size={12} direction="right" />,
                  kbd: "⌘R",
                },
                { label: "Duplicate", kbd: "⌘D" },
                "separator",
                { label: "Delete", danger: true },
              ]}
            />
          }
        />
        <div className="mk-helper" style={{ marginTop: 10 }}>
          Cliquez le ⋮ pour ouvrir le menu.
        </div>
      </div>

      <div style={rowLabel}>Breadcrumb</div>
      <Breadcrumb
        items={[
          { label: "Marketplace", href: "#" },
          { label: "Productivity", href: "#" },
          { label: "Auto-tagger" },
        ]}
      />

      <div style={rowLabel}>Pagination</div>
      <Pagination page={2} count={12} />
    </div>
  );
}

function DataPanel() {
  return (
    <div className="mk-panel">
      <div style={{ ...rowLabel, marginTop: 0 }}>
        Avatars — tailles, tons, statut, groupe
      </div>
      <div style={{ ...row, gap: 24 }}>
        <Avatar size="sm">AL</Avatar>
        <Avatar>AL</Avatar>
        <Avatar size="lg">AL</Avatar>
        <Avatar tone="coral">JR</Avatar>
        <Avatar tone="solid">MK</Avatar>
        <Avatar status="online">AL</Avatar>
        <Avatar tone="coral" status="away">
          JR
        </Avatar>
        <AvatarStack more={4}>
          <Avatar>AL</Avatar>
          <Avatar tone="coral">JR</Avatar>
          <Avatar tone="solid">MK</Avatar>
        </AvatarStack>
      </div>

      <div style={rowLabel}>Table</div>
      <Table
        columns={[
          { key: "plugin", label: "Plugin", sortable: true },
          { key: "status", label: "Statut" },
          { key: "version", label: "Version" },
          { key: "runs", label: "Exécutions", sortable: true, numeric: true },
          { key: "updated", label: "Mis à jour" },
        ]}
        rows={[
          {
            id: "auto-tagger",
            cells: [
              <span className="cell-main">
                <Avatar size="sm">AT</Avatar>
                <span>
                  <span className="t">Auto-tagger</span>
                  <br />
                  <span className="s">Alix Laurent</span>
                </span>
              </span>,
              <Badge variant="success">Published</Badge>,
              <span className="muted">2.4.1</span>,
              "48 210",
              <span className="muted">Il y a 2 h</span>,
            ],
          },
          {
            id: "slack-notifier",
            cells: [
              <span className="cell-main">
                <Avatar size="sm" tone="coral">
                  SN
                </Avatar>
                <span>
                  <span className="t">Slack notifier</span>
                  <br />
                  <span className="s">June Roy</span>
                </span>
              </span>,
              <Badge variant="info">Draft</Badge>,
              <span className="muted">0.9.0</span>,
              "1 037",
              <span className="muted">Hier</span>,
            ],
          },
        ]}
        selectable
        defaultSelected={["slack-notifier"]}
        sortKey="plugin"
      />

      <div style={rowLabel}>Progression & spinner</div>
      <div style={{ display: "grid", gap: 16, maxWidth: 380 }}>
        <Progress value={64} label="Build du plugin" />
        <Progress value={100} label="Tests" success />
        <div style={{ ...row, gap: 28 }}>
          <div style={{ flex: 1 }}>
            <Progress indeterminate />
          </div>
          <Spinner size={18} />
          <Spinner size={26} />
        </div>
      </div>

      <div style={rowLabel}>Skeleton & état vide</div>
      <div className="mk-overview-data-grid">
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Skeleton variant="square" />
            <div style={{ display: "grid", gap: 8, flex: 1 }}>
              <Skeleton variant="title" width="55%" />
              <Skeleton width="35%" />
            </div>
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
            <Skeleton />
            <Skeleton width="80%" />
          </div>
        </Card>
        <EmptyState
          title="Aucun plugin pour l'instant"
          action={<Button>Créer un plugin</Button>}
        >
          Créez votre premier plugin ou importez un manifest existant pour
          démarrer.
        </EmptyState>
      </div>
    </div>
  );
}

function AdvancedControlsPanel() {
  return (
    <div className="mk-panel">
      <div style={{ display: "grid", gap: 22, maxWidth: 480 }}>
        <Slider
          label="Timeout d'exécution"
          unit=" s"
          min={5}
          max={120}
          step={5}
          defaultValue={30}
        />
        <div className="mk-field">
          <span className="mk-field-label">Instances parallèles</span>
          <Stepper defaultValue={2} min={1} max={8} aria-label="Instances" />
        </div>
        <TextField
          label="Recherche"
          placeholder="Rechercher un plugin…"
          iconStart={
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <circle
                cx="6"
                cy="6"
                r="4.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M9.4 9.4 L12.5 12.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          }
          iconEnd={<Kbd>⌘K</Kbd>}
        />
        <div className="mk-field">
          <span className="mk-field-label">Configuration</span>
          <Accordion
            defaultOpen={["permissions"]}
            items={[
              {
                id: "permissions",
                title: "Permissions",
                meta: <Badge variant="info">3 actives</Badge>,
                content:
                  "Lecture des documents, écriture des tags, accès au presse-papier. Les permissions réseau sont désactivées par défaut.",
              },
              {
                id: "triggers",
                title: "Déclencheurs",
                content:
                  "À l'ouverture d'un document, à la création d'un bloc, ou planifié (cron).",
              },
              {
                id: "advanced",
                title: "Avancé",
                content:
                  "Variables d'environnement, version du runtime, journalisation détaillée.",
              },
            ]}
          />
        </div>
        <div className="mk-field">
          <span className="mk-field-label">Manifest</span>
          <Dropzone
            title={
              <>
                Glissez votre manifest ici ou <em>parcourez</em>
              </>
            }
            hint="JSON ou YAML · 2 Mo max"
          />
        </div>
        <FileItem
          name="manifest.json"
          meta="14 Ko · importé"
          end={<Badge variant="success">Valide</Badge>}
        />
        <div className="mk-field">
          <span className="mk-field-label">Publication</span>
          <Wizard
            steps={[
              { label: "Manifest" },
              { label: "Permissions" },
              { label: "Test" },
              { label: "Publish" },
            ]}
            current={2}
          />
        </div>
      </div>
    </div>
  );
}

function SurfacesPanel() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  return (
    <div className="mk-panel">
      <div style={{ ...rowLabel, marginTop: 0 }}>Banners</div>
      <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
        <Banner
          action={
            <Button
              size="sm"
              style={{
                background: "#FFFFFF",
                color: "#2B38C9",
                borderColor: "#FFFFFF",
              }}
            >
              Découvrir
            </Button>
          }
          onDismiss={() => {}}
        >
          <strong>Mosaik SDK 3.2 est là.</strong> Déclencheurs planifiés et
          nouveau runtime.
        </Banner>
        <Banner variant="warning" onDismiss={() => {}}>
          <strong>Maintenance planifiée</strong> — samedi 14 juin, 02:00–04:00
          UTC.
        </Banner>
      </div>

      <div style={rowLabel}>Code</div>
      <div style={{ display: "grid", gap: 14, maxWidth: 480 }}>
        <CodeBlock
          title="manifest.json"
          code={
            '{\n  "name": "auto-tagger",\n  "version": "2.4.1",\n  "permissions": ["read", "write"]\n}'
          }
        />
        <p
          style={{
            fontFamily: "var(--mk-font-ui)",
            fontSize: 13.5,
            color: "var(--mk-muted)",
            margin: 0,
          }}
        >
          Appelez <InlineCode>mosaik.run()</InlineCode> après avoir déclaré le
          déclencheur dans <InlineCode>manifest.json</InlineCode>.
        </p>
      </div>

      <div style={rowLabel}>Drawer</div>
      <div className="mk-drawer-stage" style={{ maxWidth: 640 }}>
        <div className="stage-bg">
          <Button onClick={() => setDrawerOpen(true)}>
            Configurer le bloc
          </Button>
        </div>
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Bloc : Auto-tag"
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDrawerOpen(false)}
              >
                Annuler
              </Button>
              <Button size="sm" onClick={() => setDrawerOpen(false)}>
                Enregistrer
              </Button>
            </>
          }
        >
          <TextField label="Nom du bloc" defaultValue="Auto-tag" />
          <Switch label="Actif" defaultChecked />
        </Drawer>
      </div>

      <div style={rowLabel}>Command palette</div>
      <div
        style={{
          background: "var(--mk-surface-2)",
          borderRadius: "var(--mk-c1) var(--mk-c2) var(--mk-c1) var(--mk-c2)",
          padding: "26px 18px",
          display: "flex",
          justifyContent: "center",
          maxWidth: 640,
        }}
      >
        <CommandPalette
          groups={[
            {
              label: "Plugin",
              items: [
                {
                  label: "Run plugin",
                  icon: <Triangle size={12} direction="right" />,
                  kbd: "⌘R",
                },
                { label: "Duplicate plugin", kbd: "⌘D" },
              ],
            },
            {
              label: "Workspace",
              items: [
                { label: "Search marketplace" },
                { label: "Publish…", kbd: "⇧⌘P" },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}

const exampleStyles = `
  .mk-example {
    width: 100%;
    max-width: none;
    min-width: 0;
  }

  .mk-example-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 28px;
    align-items: start;
    margin-bottom: 28px;
  }

  .mk-example-title {
    font-family: var(--mk-font-display);
    font-size: 30px;
    font-weight: 600;
    letter-spacing: -.02em;
    margin: 0;
  }

  .mk-example-description {
    font-size: 14.5px;
    color: var(--mk-muted);
    max-width: 66ch;
    margin: 10px 0 0;
  }

  .mk-example-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .mk-example-stack {
    display: grid;
    gap: 22px;
  }

  .mk-example-metrics-3,
  .mk-example-metrics-4,
  .mk-example-card-grid,
  .mk-example-form-grid,
  .mk-example-filter,
  .mk-example-runtime,
  .mk-example-split-market,
  .mk-example-split-builder,
  .mk-example-split-ops,
  .mk-example-split-even,
  .mk-overview-input-grid,
  .mk-overview-two-col,
  .mk-overview-card-grid,
  .mk-overview-data-grid {
    display: grid;
    min-width: 0;
  }

  .mk-example-metrics-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .mk-example-metrics-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .mk-example-split-market {
    grid-template-columns: minmax(0, 1.5fr) minmax(280px, .8fr);
    gap: 22px;
    align-items: start;
  }

  .mk-example-split-builder {
    grid-template-columns: minmax(0, 1fr) minmax(320px, .86fr);
    gap: 22px;
    align-items: start;
  }

  .mk-example-split-ops {
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, .82fr);
    gap: 22px;
    align-items: start;
  }

  .mk-example-split-even {
    grid-template-columns: minmax(0, .95fr) minmax(0, 1fr);
    gap: 22px;
    align-items: start;
  }

  .mk-example-filter {
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 14px;
    align-items: end;
  }

  .mk-example-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 22px;
  }

  .mk-example-form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px 20px;
  }

  .mk-example-runtime {
    grid-template-columns: minmax(0, 1fr) 160px;
    gap: 22px;
    align-items: end;
    max-width: 620px;
  }

  .mk-overview-input-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px 20px;
  }

  .mk-overview-two-col,
  .mk-overview-card-grid,
  .mk-overview-data-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    align-items: start;
  }

  .mk-overview-card-grid {
    gap: 16px;
  }

  .mk-example-health-row {
    display: flex;
    justify-content: space-between;
    gap: 18px;
  }

  .mk-example-health-bars {
    display: grid;
    gap: 14px;
    min-width: 360px;
  }

  .mk-example .mk-panel {
    min-width: 0;
    overflow-x: auto;
  }

  .mk-example .span-all {
    grid-column: 1 / -1;
  }

  .mk-example .mk-drawer-stage {
    width: 100%;
    max-width: none;
  }

  @media (max-width: 980px) {
    .mk-example-head,
    .mk-example-split-market,
    .mk-example-split-builder,
    .mk-example-split-ops,
    .mk-example-split-even {
      grid-template-columns: minmax(0, 1fr);
    }

    .mk-example-actions {
      justify-content: flex-start;
    }

    .mk-example-metrics-3,
    .mk-example-metrics-4,
    .mk-example-card-grid,
    .mk-example-form-grid,
    .mk-example-filter,
    .mk-example-runtime,
    .mk-overview-input-grid,
    .mk-overview-two-col,
    .mk-overview-card-grid,
    .mk-overview-data-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .mk-example-runtime {
      max-width: none;
    }

    .mk-example-health-row {
      display: grid;
    }

    .mk-example-health-bars {
      min-width: 0;
    }
  }

  @media (min-width: 981px) and (max-width: 1240px) {
    .mk-example-metrics-4 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .mk-example-title {
      font-size: 24px;
    }

    .mk-example-description {
      font-size: 13.5px;
    }

    .mk-example-stack {
      gap: 16px;
    }
  }
`;

function ExampleShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mk-example">
      <style>{exampleStyles}</style>
      <div className="mk-example-head">
        <div>
          <div
            style={{
              ...secNum,
              color: "#FF6E64",
              marginBottom: 8,
            }}
          >
            {eyebrow}
          </div>
          <h1 className="mk-example-title">{title}</h1>
          <p className="mk-example-description">{description}</p>
        </div>
        {actions != null && <div className="mk-example-actions">{actions}</div>}
      </div>
      <div className="mk-example-stack">{children}</div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "success" | "neutral" | "info" | "featured" | "danger";
}) {
  return (
    <Card
      title={value}
      author={label}
      description={detail}
      badge={
        <Badge variant={tone}>{tone === "success" ? "Live" : "Now"}</Badge>
      }
      icon={<Triangle size={18} direction="right" />}
    />
  );
}

function PluginIdentity({
  initials,
  tone = "default",
  title,
  subtitle,
}: {
  initials: string;
  tone?: "default" | "coral" | "solid";
  title: string;
  subtitle: string;
}) {
  return (
    <span className="cell-main">
      <Avatar size="sm" tone={tone}>
        {initials}
      </Avatar>
      <span>
        <span className="t">{title}</span>
        <br />
        <span className="s">{subtitle}</span>
      </span>
    </span>
  );
}

function MarketplaceLaunchPage() {
  return (
    <ExampleShell
      eyebrow="Example 01"
      title="Marketplace launch room"
      description="Une page commerciale complète pour mettre en avant les plugins, filtrer le catalogue, rassurer avec des signaux de qualité et pousser l'installation."
      actions={
        <>
          <Button
            variant="primary"
            icon={<Triangle size={13} direction="right" />}
          >
            Launch collection
          </Button>
          <Button variant="outline">View analytics</Button>
        </>
      }
    >
      <Banner
        action={
          <Button
            size="sm"
            style={{
              background: "#FFFFFF",
              color: "#2B38C9",
              borderColor: "#FFFFFF",
            }}
          >
            Découvrir
          </Button>
        }
        onDismiss={() => {}}
      >
        <strong>New marketplace drop.</strong> 24 certified automations ready
        for your workspace.
      </Banner>

      <div className="mk-example-metrics-3">
        <MetricCard
          label="Install-ready plugins"
          value="124"
          detail="Curated packs with runtime checks and verified manifests."
          tone="success"
        />
        <MetricCard
          label="Average activation"
          value="2.8 min"
          detail="From search to first run, including permission review."
          tone="info"
        />
        <MetricCard
          label="Partner revenue"
          value="€48.2k"
          detail="Projected monthly marketplace gross volume."
          tone="featured"
        />
      </div>

      <div className="mk-example-split-market">
        <div className="mk-panel">
          <Breadcrumb
            items={[
              { label: "Marketplace", href: "#" },
              { label: "Collections", href: "#" },
              { label: "Automation starters" },
            ]}
          />
          <div style={{ ...rowLabel, marginTop: 26 }}>Campaign controls</div>
          <div className="mk-example-filter">
            <TextField
              label="Search"
              placeholder="Find a workflow…"
              iconEnd={<Kbd>⌘K</Kbd>}
            />
            <Select
              label="Audience"
              options={["All teams", "Builders", "Admins", "Partners"]}
              defaultValue="All teams"
            />
          </div>
          <div style={{ marginTop: 18 }}>
            <Tabs
              items={[
                { value: "featured", label: "Featured", count: 12 },
                { value: "trending", label: "Trending", count: 8 },
                { value: "new", label: "New" },
                { value: "private", label: "Private" },
              ]}
              defaultValue="featured"
            />
          </div>

          <div className="mk-example-card-grid">
            <Card
              title="Auto-tagger"
              author="par Lena K. · certified"
              description="Classe les pages Notion avec des tags générés depuis le contenu."
              icon={<Triangle size={18} />}
              badge={<Badge variant="success">Published</Badge>}
              action={<Button size="sm">Install</Button>}
            />
            <Card
              title="Linear ↔ Slack Sync"
              author="par Tomas R. · partner"
              description="Synchronise les issues Linear avec vos canaux Slack, dans les deux sens."
              icon={<Triangle size={18} direction="right" />}
              iconTone="coral"
              badge={<Badge variant="info">Beta</Badge>}
              action={
                <Button variant="tonal" size="sm">
                  Preview
                </Button>
              }
            />
            <Card
              title="Figma handoff"
              author="par June Roy · featured"
              description="Génère automatiquement notes de release, assets et checklist QA."
              icon={PlusIcon}
              badge={<Badge variant="featured">Featured</Badge>}
              action={
                <Button variant="outline" size="sm">
                  Details
                </Button>
              }
            />
            <Card
              title="Markdown Export"
              author="par vous · draft"
              description="Transforme vos docs internes en packages téléchargeables."
              icon={<Triangle size={18} direction="down" />}
              badge={<Badge variant="neutral">Draft</Badge>}
              action={
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              }
            />
          </div>
        </div>

        <div className="mk-panel">
          <Alert variant="success" title="Campaign ready" onDismiss={() => {}}>
            Every highlighted plugin passed manifest validation and runtime
            smoke tests.
          </Alert>
          <div style={rowLabel}>Audience tags</div>
          <div style={row}>
            <Tag active>productivity</Tag>
            <Tag>notion</Tag>
            <Tag>ai-ready</Tag>
            <Tag removable={false}>certified</Tag>
          </div>
          <div style={rowLabel}>Curators</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <AvatarStack more={6}>
              <Avatar status="online">LK</Avatar>
              <Avatar tone="coral" status="away">
                TR
              </Avatar>
              <Avatar tone="solid">JR</Avatar>
            </AvatarStack>
            <span style={{ color: "var(--mk-muted)", fontSize: 13 }}>
              9 reviewers online before launch.
            </span>
          </div>
          <div style={rowLabel}>Quality gates</div>
          <div style={{ display: "grid", gap: 12 }}>
            <Checkbox label="Manifest signed" defaultChecked />
            <Checkbox label="Permissions explained" defaultChecked />
            <Checkbox label="Public listing copy approved" defaultChecked />
          </div>
        </div>
      </div>

      <div className="mk-panel">
        <div style={{ ...rowLabel, marginTop: 0 }}>Featured pipeline</div>
        <Table
          columns={[
            { key: "plugin", label: "Plugin", sortable: true },
            { key: "status", label: "Status" },
            {
              key: "installs",
              label: "Installs",
              sortable: true,
              numeric: true,
            },
            { key: "owner", label: "Owner" },
            { key: "action", label: "Action" },
          ]}
          rows={[
            {
              id: "auto-tagger-market",
              cells: [
                <PluginIdentity
                  initials="AT"
                  title="Auto-tagger"
                  subtitle="Notion · AI"
                />,
                <Badge variant="success">Published</Badge>,
                "48 210",
                <Avatar size="sm" status="online">
                  LK
                </Avatar>,
                <ActionMenu
                  items={[
                    {
                      label: "Promote",
                      icon: <Triangle size={12} direction="right" />,
                    },
                    { label: "Duplicate campaign" },
                    "separator",
                    { label: "Archive", danger: true },
                  ]}
                />,
              ],
            },
            {
              id: "figma-handoff-market",
              cells: [
                <PluginIdentity
                  initials="FH"
                  tone="coral"
                  title="Figma handoff"
                  subtitle="Design systems"
                />,
                <Badge variant="featured">Featured</Badge>,
                "18 405",
                <Avatar size="sm" tone="coral">
                  JR
                </Avatar>,
                <Button variant="ghost" size="sm">
                  Review
                </Button>,
              ],
            },
          ]}
          selectable
          defaultSelected={["auto-tagger-market"]}
          sortKey="installs"
        />
        <div style={{ marginTop: 18 }}>
          <Pagination page={1} count={7} />
        </div>
      </div>
    </ExampleShell>
  );
}

function PluginBuilderPage() {
  return (
    <ExampleShell
      eyebrow="Example 02"
      title="Plugin builder checkout"
      description="Une surface de configuration qui combine formulaire, validation, import, manifest et étapes de publication pour montrer Mosaik en contexte builder."
      actions={
        <>
          <Button variant="ghost">Save draft</Button>
          <Button icon={<Triangle size={13} direction="right" />}>
            Run test
          </Button>
        </>
      }
    >
      <div className="mk-panel">
        <Wizard
          steps={[
            { label: "Manifest" },
            { label: "Permissions" },
            { label: "Test" },
            { label: "Publish" },
          ]}
          current={1}
        />
      </div>

      <div className="mk-example-split-builder">
        <div className="mk-panel">
          <div className="mk-example-form-grid">
            <TextField
              label="Plugin name"
              defaultValue="Launch Brief"
              helper="Visible in catalog cards and run history."
            />
            <Select
              label="Primary app"
              labelHint="Required"
              options={["Notion", "Figma", "Slack", "Linear", "GitHub"]}
              defaultValue="Notion"
            />
            <Select
              className="span-all"
              label="Distribution"
              multiple
              options={[
                "Public marketplace",
                "Private workspace",
                "Partner beta",
              ]}
              defaultValue={["Private workspace", "Partner beta"]}
              helper="Choose all channels this build can target."
            />
            <Textarea
              className="span-all"
              label="Listing pitch"
              maxLength={320}
              showCount
              defaultValue="Create launch summaries, assign owners, and trigger follow-up automations from one brief."
              helper="Short, outcome-focused copy performs best."
            />
          </div>

          <div style={rowLabel}>Runtime tuning</div>
          <div className="mk-example-runtime">
            <Slider
              label="Execution timeout"
              unit=" s"
              min={5}
              max={180}
              step={5}
              defaultValue={45}
            />
            <div className="mk-field">
              <span className="mk-field-label">Parallel runs</span>
              <Stepper
                defaultValue={3}
                min={1}
                max={8}
                aria-label="Parallel runs"
              />
            </div>
          </div>

          <div style={rowLabel}>Permissions</div>
          <Accordion
            defaultOpen={["read", "write"]}
            items={[
              {
                id: "read",
                title: "Read workspace content",
                meta: <Badge variant="success">Required</Badge>,
                content:
                  "Needed to inspect pages and compose launch summaries.",
              },
              {
                id: "write",
                title: "Create follow-up tasks",
                meta: <Badge variant="info">Scoped</Badge>,
                content: "Only writes inside the selected launch project.",
              },
              {
                id: "network",
                title: "Outbound network",
                meta: <Badge variant="neutral">Disabled</Badge>,
                content: "No external calls are made by this plugin version.",
              },
            ]}
          />

          <div style={rowLabel}>Feature flags</div>
          <div style={{ ...row, gap: 28 }}>
            <Switch label="Auto-publish after tests" />
            <Switch label="Sandboxed runtime" defaultChecked />
            <Checkbox label="Require admin approval" defaultChecked />
          </div>
        </div>

        <div className="mk-panel">
          <SegmentedControl
            options={["Visual", "Manifest", "Logs"]}
            defaultValue="Manifest"
            aria-label="Builder panel"
          />
          <div style={{ marginTop: 22 }}>
            <Dropzone
              title={
                <>
                  Drop manifest or <em>browse</em>
                </>
              }
              hint="JSON ou YAML · 2 Mo max"
              accept=".json,.yaml,.yml"
            />
          </div>
          <div style={{ marginTop: 14 }}>
            <FileItem
              name="launch-brief.manifest.json"
              meta="18 Ko · imported"
              end={<Badge variant="success">Valid</Badge>}
            />
          </div>
          <div style={{ marginTop: 18 }}>
            <CodeBlock
              title="manifest.json"
              code={
                '{\n  "name": "launch-brief",\n  "runtime": "mosaik:3.2",\n  "permissions": ["read", "write"]\n}'
              }
            />
          </div>
          <div style={{ ...rowLabel, marginTop: 22 }}>Inline guidance</div>
          <div
            style={{ display: "inline-flex", alignItems: "center", gap: 12 }}
          >
            <Button variant="tonal" size="sm">
              Why these permissions?
            </Button>
            <FloatingLayer
              placement="right"
              title="Permission copy sells trust"
              actions={
                <>
                  <FloatingButton>Docs</FloatingButton>
                  <FloatingButton variant="primary">
                    Use template
                  </FloatingButton>
                </>
              }
            >
              Explain the business outcome, not just the API scope.
            </FloatingLayer>
          </div>
        </div>
      </div>
    </ExampleShell>
  );
}

function OpsCommandCenterPage() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(true);
  const { toasts, push, dismiss } = useToasts();

  return (
    <ExampleShell
      eyebrow="Example 03"
      title="Operations command center"
      description="Un dashboard dense pour piloter les runs, surveiller les incidents, communiquer l'état système et lancer des actions rapides."
      actions={
        <>
          <Button
            variant="tonal"
            onClick={() => setPaletteOpen((open) => !open)}
          >
            Toggle palette
          </Button>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            Open run drawer
          </Button>
          <Button variant="danger" onClick={() => setModalOpen(true)}>
            Stop rollout
          </Button>
        </>
      }
    >
      <div className="mk-example-metrics-4">
        <MetricCard
          label="Runs today"
          value="18 402"
          detail="+12% compared with last Tuesday."
          tone="success"
        />
        <MetricCard
          label="Failure rate"
          value="0.42%"
          detail="Below alert threshold for 6 hours."
          tone="info"
        />
        <MetricCard
          label="Queue depth"
          value="213"
          detail="Autoscaling keeps ETA below 90 seconds."
          tone="neutral"
        />
        <MetricCard
          label="Incidents"
          value="1"
          detail="Slack notifier needs partner review."
          tone="danger"
        />
      </div>

      <div className="mk-example-split-ops">
        <div className="mk-panel">
          <div className="mk-example-health-row">
            <div>
              <div style={{ ...rowLabel, marginTop: 0 }}>Release health</div>
              <div className="mk-example-health-bars">
                <Progress
                  value={76}
                  label="Marketplace rollout"
                  valueText="76%"
                  success
                />
                <Progress
                  value={38}
                  label="Partner validation"
                  valueText="38%"
                />
                <Progress indeterminate label="Synthetic smoke tests" />
              </div>
            </div>
            <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <Spinner size={26} />
              <AvatarStack more={3}>
                <Avatar status="online">AL</Avatar>
                <Avatar tone="coral">JR</Avatar>
                <Avatar tone="solid" status="away">
                  MK
                </Avatar>
              </AvatarStack>
            </div>
          </div>

          <div style={rowLabel}>Runs requiring attention</div>
          <Table
            columns={[
              { key: "run", label: "Run", sortable: true },
              { key: "status", label: "Status" },
              { key: "duration", label: "Duration", numeric: true },
              { key: "owner", label: "Owner" },
              { key: "action", label: "Action" },
            ]}
            rows={[
              {
                id: "run-7842",
                cells: [
                  <PluginIdentity
                    initials="AT"
                    title="Auto-tagger"
                    subtitle="run #7842"
                  />,
                  <Badge variant="success">Healthy</Badge>,
                  "42 s",
                  <Avatar size="sm" status="online">
                    AL
                  </Avatar>,
                  <ActionMenu
                    items={[
                      {
                        label: "Open logs",
                        icon: <Triangle size={12} direction="right" />,
                      },
                      { label: "Replay run" },
                      "separator",
                      { label: "Mute alerts", danger: true },
                    ]}
                  />,
                ],
              },
              {
                id: "run-7843",
                cells: [
                  <PluginIdentity
                    initials="SN"
                    tone="coral"
                    title="Slack notifier"
                    subtitle="run #7843"
                  />,
                  <Badge variant="danger">Failed</Badge>,
                  "3 m 12 s",
                  <Avatar size="sm" tone="coral">
                    JR
                  </Avatar>,
                  <Button
                    variant="tonal"
                    size="sm"
                    onClick={() => setDrawerOpen(true)}
                  >
                    Inspect
                  </Button>,
                ],
              },
            ]}
            selectable
            defaultSelected={["run-7843"]}
            sortKey="run"
          />
        </div>

        <div className="mk-panel">
          <Alert
            variant="warning"
            title="Partner endpoint degraded"
            onDismiss={() => {}}
          >
            Slack notifier is retrying with exponential backoff. Customer-facing
            automation remains queued.
          </Alert>
          <div style={rowLabel}>Operator actions</div>
          <div style={row}>
            <Button
              variant="tonal"
              size="sm"
              onClick={() =>
                push("success", {
                  title: "Replay queued",
                  text: "Slack notifier will run again in 30 seconds.",
                })
              }
            >
              Queue replay
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                push("info", {
                  title: "Owner paged",
                  text: "June Roy received the escalation.",
                })
              }
            >
              Page owner
            </Button>
          </div>
          <div style={rowLabel}>Safety switches</div>
          <div style={{ display: "grid", gap: 12 }}>
            <Switch label="Pause risky plugins" />
            <Switch label="Notify admins" defaultChecked />
            <Checkbox label="Require manual replay" defaultChecked />
          </div>
          <div style={rowLabel}>Live toast zone</div>
          <div
            style={{
              position: "relative",
              height: 240,
              background: "var(--mk-surface-2)",
              borderRadius:
                "var(--mk-c1) var(--mk-c2) var(--mk-c1) var(--mk-c2)",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12.5,
                color: "var(--mk-muted)",
                pointerEvents: "none",
              }}
            >
              Operator notifications appear here
            </span>
            <ToastZone>
              {toasts.map((t) => (
                <Toast
                  key={t.id}
                  kind={t.kind}
                  title={t.title}
                  leaving={t.leaving}
                  onDismiss={() => dismiss(t.id)}
                >
                  {t.text}
                </Toast>
              ))}
            </ToastZone>
          </div>
        </div>
      </div>

      <div className="mk-example-split-even">
        <div className="mk-panel">
          <div style={{ ...rowLabel, marginTop: 0 }}>Command palette</div>
          {paletteOpen ? (
            <div
              style={{
                background: "var(--mk-surface-2)",
                borderRadius:
                  "var(--mk-c1) var(--mk-c2) var(--mk-c1) var(--mk-c2)",
                padding: "26px 18px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CommandPalette
                groups={[
                  {
                    label: "Operations",
                    items: [
                      {
                        label: "Replay failed run",
                        icon: <Triangle size={12} direction="right" />,
                        kbd: "R",
                      },
                      { label: "Open incident drawer", kbd: "I" },
                      { label: "Publish status update", kbd: "S" },
                    ],
                  },
                  {
                    label: "Workspace",
                    items: [
                      { label: "Invite reviewer" },
                      { label: "Export run logs", kbd: "⌘E" },
                    ],
                  },
                ]}
              />
            </div>
          ) : (
            <EmptyState
              title="Palette hidden"
              action={
                <Button onClick={() => setPaletteOpen(true)}>
                  Show palette
                </Button>
              }
            >
              Operators can keep the page calm until they need fast commands.
            </EmptyState>
          )}
        </div>

        <div className="mk-panel">
          <div style={{ ...rowLabel, marginTop: 0 }}>Incident workspace</div>
          {modalOpen && (
            <Modal
              inline
              variant="danger"
              metaLabel="Rollout control · Slack notifier"
              title="Stop current rollout?"
              footNote="Customers keep their existing stable version."
              details={
                <>
                  <span>
                    <strong>213</strong> queued runs
                  </span>
                  <span>
                    failure · <strong>3.8%</strong>
                  </span>
                  <span>
                    owner · <strong>June Roy</strong>
                  </span>
                </>
              }
              actions={
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setModalOpen(false)}
                  >
                    Stop rollout
                  </Button>
                </>
              }
              onClose={() => setModalOpen(false)}
            >
              This will pause promotion while keeping retries active for already
              scheduled safe jobs.
            </Modal>
          )}
          {!modalOpen && (
            <EmptyState
              title="No blocking rollout"
              action={
                <Button variant="danger" onClick={() => setModalOpen(true)}>
                  Open stop dialog
                </Button>
              }
            >
              Use the modal when an operator needs a high-friction confirmation.
            </EmptyState>
          )}
        </div>
      </div>

      <div className="mk-drawer-stage">
        <div className="stage-bg">
          <Button onClick={() => setDrawerOpen(true)}>
            Inspect failed run
          </Button>
        </div>
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Run #7843 · Slack notifier"
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDrawerOpen(false)}
              >
                Close
              </Button>
              <Button size="sm" onClick={() => setDrawerOpen(false)}>
                Replay now
              </Button>
            </>
          }
        >
          <Alert variant="danger" title="Webhook timeout">
            Partner endpoint did not acknowledge within 30 seconds.
          </Alert>
          <TextField label="Owner" defaultValue="June Roy" />
          <Select
            label="Escalation lane"
            options={["Partner", "Runtime", "Customer success"]}
            defaultValue="Partner"
          />
          <CodeBlock
            title="last-error.log"
            code={
              "POST /hooks/slack-notifier\nstatus: 504 gateway timeout\nretry: scheduled in 30s"
            }
            lineNumbers={false}
          />
        </Drawer>
      </div>
    </ExampleShell>
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
    <div className="mk-example">
      <style>{exampleStyles}</style>
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
      <section>
        <div style={secHead}>
          <span style={secNum}>06</span>
          <h2 style={secTitle}>Modals &amp; Couche flottante</h2>
        </div>
        <ContainersPanel />
      </section>
      <section>
        <div style={secHead}>
          <span style={secNum}>07</span>
          <h2 style={secTitle}>Feedback</h2>
        </div>
        <FeedbackPanel />
      </section>
      <section>
        <div style={secHead}>
          <span style={secNum}>08</span>
          <h2 style={secTitle}>Navigation</h2>
        </div>
        <NavigationPanel />
      </section>
      <section>
        <div style={secHead}>
          <span style={secNum}>09</span>
          <h2 style={secTitle}>Data</h2>
        </div>
        <DataPanel />
      </section>
      <section>
        <div style={secHead}>
          <span style={secNum}>10</span>
          <h2 style={secTitle}>Contrôles avancés</h2>
        </div>
        <AdvancedControlsPanel />
      </section>
      <section>
        <div style={secHead}>
          <span style={secNum}>11</span>
          <h2 style={secTitle}>Surfaces</h2>
        </div>
        <SurfacesPanel />
      </section>
    </div>
  ),
};

export const MarketplaceLaunch: Story = {
  render: () => <MarketplaceLaunchPage />,
};

export const PluginBuilder: Story = {
  render: () => <PluginBuilderPage />,
};

export const OpsCommandCenter: Story = {
  render: () => <OpsCommandCenterPage />,
};
