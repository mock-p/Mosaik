import * as React from "react";
import type { Decorator, Preview } from "@storybook/react";
import "../src/styles.css";

const withMosaikTheme: Decorator = (Story, context) => {
  const dark = context.globals.theme === "dark";
  return (
    <div
      className={dark ? "dark" : undefined}
      style={{
        minHeight: "100vh",
        padding: 48,
        background: "var(--mk-page)",
        color: "var(--mk-text)",
        fontFamily: "var(--mk-font-ui)",
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Mosaik color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [withMosaikTheme],
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
  },
};

export default preview;
