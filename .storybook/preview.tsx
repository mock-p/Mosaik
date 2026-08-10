import * as React from "react";
import type { Decorator, Preview } from "@storybook/react";
import "@fontsource-variable/parkinsans";
import "@fontsource-variable/dm-sans";
import "../src/styles.css";

type PreviewFontVariables = React.CSSProperties & {
  "--mk-font-display": string;
  "--mk-font-btn": string;
  "--mk-font-ui": string;
};

const withMosaikTheme: Decorator = (Story, context) => {
  const dark = context.globals.theme === "dark";
  const docs = context.viewMode === "docs";

  return (
    <div
      className={dark ? "dark" : undefined}
      style={{
        "--mk-font-display": '"Parkinsans Variable", sans-serif',
        "--mk-font-btn": '"Parkinsans Variable", sans-serif',
        "--mk-font-ui": '"DM Sans Variable", sans-serif',
        minHeight: docs ? undefined : "100vh",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        padding: "clamp(16px, 4vw, 48px)",
        background: "var(--mk-page)",
        color: "var(--mk-text)",
        fontFamily: "var(--mk-font-ui)",
      } as PreviewFontVariables}
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
    viewport: {
      viewports: {
        mobile320: { name: "Mobile 320", styles: { width: "320px", height: "568px" } },
        mobile390: { name: "Mobile 390", styles: { width: "390px", height: "844px" } },
        tablet: { name: "Tablet", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop", styles: { width: "1440px", height: "900px" } },
      },
    },
    a11y: { element: "#storybook-root", config: {}, options: {}, manual: false },
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
