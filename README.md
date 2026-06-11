# Mosaik

Mosaik is the UI library foundation for Mocka.

Status: initial scaffold. No components yet.

## Goals

- Provide a shared UI foundation for Mocka products.
- Keep components Tailwind-based.
- Support future usage from the Mocka v4 module ecosystem and the website.
- Document usage and visual rules through Storybook.

## Scripts

```bash
pnpm dev
pnpm typecheck
pnpm build
```

`pnpm dev` starts Storybook on port 6006.

## Future package usage

```ts
import "@mocka/mosaik/styles.css";
```

Component exports will be added later.
