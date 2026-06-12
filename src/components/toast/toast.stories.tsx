import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { Radio } from "../radio";
import {
  Toast,
  ToastZone,
  useToasts,
  type ToastAnimation,
  type ToastKind,
} from "./toast";

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  tags: ["autodocs"],
  args: {
    kind: "success",
    title: "Plugin published",
    children: "Auto-tagger v2.4.1 est en ligne sur la marketplace.",
    animation: "slide",
    duration: 4200,
    onDismiss: () => {},
  },
  argTypes: {
    kind: {
      control: "inline-radio",
      options: ["success", "info", "warning", "error"],
    },
    animation: {
      control: "inline-radio",
      options: ["slide", "bounce", "unfold"],
    },
    title: { control: "text" },
    children: { control: "text" },
    duration: { control: { type: "number", min: 0, step: 500 } },
    leaving: { control: "boolean" },
    onDismiss: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const CONTENT: Record<ToastKind, { title: string; text: string }> = {
  success: {
    title: "Plugin published",
    text: "Auto-tagger v2.4.1 est en ligne sur la marketplace.",
  },
  info: { title: "Build started", text: "Compilation du plugin en cours…" },
  warning: {
    title: "Quota presque atteint",
    text: "92 % des exécutions mensuelles utilisées.",
  },
  error: {
    title: "Publication échouée",
    text: "Le manifest contient une erreur de syntaxe.",
  },
};

function ToastStage() {
  const { toasts, push, dismiss } = useToasts();
  const [animation, setAnimation] = React.useState<ToastAnimation>("slide");

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
        {(["slide", "bounce", "unfold"] as const).map((a) => (
          <Radio
            key={a}
            name="toast-anim"
            label={
              { slide: "Glissement", bounce: "Rebond", unfold: "Dépliage" }[a]
            }
            checked={animation === a}
            onChange={() => setAnimation(a)}
          />
        ))}
      </div>
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}
      >
        {(["success", "info", "warning", "error"] as const).map((kind) => (
          <Button
            key={kind}
            variant="tonal"
            size="sm"
            onClick={() => push(kind, CONTENT[kind])}
          >
            {kind}
          </Button>
        ))}
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
              animation={animation}
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

export const LiveStage: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ToastStage />,
};
