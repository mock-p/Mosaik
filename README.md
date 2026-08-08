# Mosaik

Mosaik is Mocka's public React component library and visual foundation. It provides shared design tokens, accessible UI controls, application surfaces, and responsive layout and typography primitives for Mocka products and websites.

## Requirements

- React 18 or 19
- React DOM 18 or 19
- An ESM-capable bundler

The `0.1.x` root entrypoint is a client entrypoint. This keeps hook-based components safe when imported from a Next.js App Router project. Server Components can render Mosaik components, but event handlers and other non-serializable props must originate in a Client Component.

## Install

```bash
pnpm add @mocka/mosaik
```

Import the complete stylesheet once from the application root:

```ts
import "@mocka/mosaik/styles.css";
```

Then import components from the package root:

```tsx
import { Button, Container, Heading, Stack } from "@mocka/mosaik";

export function Example() {
  return (
    <Container size="lg">
      <Stack gap="lg">
        <Heading level={1}>Build with Mocka</Heading>
        <Button>Get started</Button>
      </Stack>
    </Container>
  );
}
```

Mosaik does not load fonts from the network. Applications should load or self-host **Parkinsans** and **DM Sans**, then override `--mk-font-display` and `--mk-font-ui` if different font-family names are used.

## CSS contract

Three CSS entrypoints are published:

- `@mocka/mosaik/styles.css` — tokens and component styles; recommended default.
- `@mocka/mosaik/tokens.css` — design tokens only.
- `@mocka/mosaik/components.css` — component styles only; import tokens separately or define compatible `--mk-*` variables.

The package does not ship Tailwind Preflight or another global reset. Component selectors use the `mk-` prefix. Tokens live on `:root`; add `.dark` to an ancestor to activate the dark palette. Set `data-mk-corner="trbl"` on a subtree to flip the asymmetric corner axis.

## Components

Mosaik includes:

- Actions and forms: Button, LinkButton, TextField, Textarea, Select, Checkbox, Radio, Switch, Slider, Stepper, SegmentedControl.
- Layout and typography: Container, Section, Stack, Cluster, Grid, Surface, Divider, Heading, Text, Prose.
- Navigation: Tabs, Breadcrumb, Pagination, ActionMenu, Accordion.
- Feedback and data display: Alert, Banner, Toast, Progress, Spinner, Skeleton, EmptyState, Badge, Tag, Card, Avatar, Table.
- Overlays and workflows: Modal, Drawer, FloatingLayer, CommandPalette, Dropzone, FileItem, Wizard.
- Technical content: CodeBlock, InlineCode, Kbd, Triangle.

Storybook documents variants, compositions, light and dark themes, and responsive examples.

## Development

```bash
pnpm dev
pnpm typecheck
pnpm build
pnpm pack
```

`pnpm dev` starts Storybook on port 6006. `pnpm build` produces ESM JavaScript, declarations, source maps, and all three CSS entrypoints in `dist/`.

## Browser support

Mosaik targets current evergreen browsers. Its styles use modern CSS features including custom properties, `color-mix()`, `:has()`, and `text-wrap`.
