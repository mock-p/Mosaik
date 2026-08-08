import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { LinkButton } from "../link-button";
import { Heading, Prose, Text } from "../typography";
import { Cluster, Container, Divider, Grid, Section, Stack, Surface } from "./layout";

const meta = {
  title: "Foundations/Layout & type",
  component: Container,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResponsivePageFoundation: Story = {
  render: () => (
    <Section spacing="lg" tone="subtle" style={{ minWidth: "min(100%, 1120px)" }}>
      <Container size="lg">
        <Stack gap="2xl">
          <Stack gap="md">
            <Text size="sm" tone="brand" weight="semibold">
              Mosaik foundations
            </Text>
            <Heading level={1} size="display">
              Clear structure, distinctive rhythm.
            </Heading>
            <Text size="lg" tone="muted" measure="default">
              Layout primitives carry the Mocka identity without forcing every page section into
              an application card.
            </Text>
            <Cluster gap="sm">
              <LinkButton href="#foundation-grid">Explore foundations</LinkButton>
              <Button variant="outline">Open Storybook</Button>
            </Cluster>
          </Stack>

          <Divider tone="brand" />

          <Grid id="foundation-grid" columns={3} gap="lg">
            {[
              ["Container", "Readable page widths and fluid gutters."],
              ["Grid", "Responsive columns that collapse without page-specific CSS."],
              ["Surface", "Mosaik corners and palette treatments for meaningful grouping."],
            ].map(([title, description], index) => (
              <Surface key={title} variant={index === 1 ? "raised" : "outlined"} padding="md">
                <Stack gap="sm">
                  <Heading level={2} size="md">
                    {title}
                  </Heading>
                  <Text size="sm" tone="muted">
                    {description}
                  </Text>
                </Stack>
              </Surface>
            ))}
          </Grid>

          <Prose>
            <h2>Prose stays readable</h2>
            <p>
              Documentation and editorial pages keep semantic HTML, comfortable measure, and
              consistent links while sharing the same visual tokens as product surfaces.
            </p>
            <blockquote>Components provide structure. Content still decides hierarchy.</blockquote>
          </Prose>
        </Stack>
      </Container>
    </Section>
  ),
};
