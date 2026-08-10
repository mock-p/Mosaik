import assert from "node:assert/strict";
import { after, test } from "node:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Window } from "happy-dom";
import { createServer } from "vite";

const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
const { Table } = await server.ssrLoadModule("/src/components/table/table.tsx");
after(() => server.close());

test("interactive table rows expose a real link and activate with click, Enter, and Space", async () => {
  const window = new Window({ url: "https://mosaik.test/table" });
  Object.assign(globalThis, {
    document: window.document,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    KeyboardEvent: window.KeyboardEvent,
    MouseEvent: window.MouseEvent,
    Node: window.Node,
    window,
  });

  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const activations = [];
  await act(async () => {
    root.render(React.createElement(Table, {
      caption: "Projects",
      columns: [{ key: "name", label: "Name" }, { key: "owner", label: "Owner" }],
      onRowActivate: (row, event) => {
        event.preventDefault();
        activations.push(row.id);
      },
      rows: [{
        id: "atlas",
        cells: ["Atlas", "Ada"],
        rowHref: "/projects/atlas",
        rowLabel: "Open Atlas",
      }],
    }));
  });

  const row = host.querySelector("tbody tr");
  const link = row.querySelector("a");
  assert.ok(link, "interactive row renders an actual link");
  assert.equal(link.getAttribute("href"), "/projects/atlas");
  assert.equal(link.getAttribute("aria-label"), "Open Atlas");
  assert.equal(row.getAttribute("role"), null, "native table row semantics are preserved");
  assert.equal(row.getAttribute("tabindex"), null, "only the real link enters the tab order");
  assert.match(link.className, /mk-table-row-link/);

  await act(async () => link.click());

  const enterEvent = new window.KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" });
  await act(async () => link.dispatchEvent(enterEvent));
  assert.equal(enterEvent.defaultPrevented, false, "Enter remains owned by native link activation");
  assert.deepEqual(activations, ["atlas"], "keydown does not duplicate native Enter activation");
  await act(async () => link.click()); // Browser-synthesized click from native Enter activation.

  const spaceEvent = new window.KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: " " });
  await act(async () => link.dispatchEvent(spaceEvent));
  assert.equal(spaceEvent.defaultPrevented, true, "Space is normalized without scrolling the page");
  assert.deepEqual(activations, ["atlas", "atlas", "atlas"]);

  link.focus();
  assert.equal(document.activeElement, link);
  assert.match(link.className, /mk-table-row-link/, "focus-visible styling has a stable selector");

  await act(async () => root.unmount());
  window.close();
});
