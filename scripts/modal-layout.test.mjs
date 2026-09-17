import assert from "node:assert/strict";
import { after, test } from "node:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Window } from "happy-dom";
import { createServer } from "vite";

const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
const { Modal } = await server.ssrLoadModule("/src/components/modal/modal.tsx");
after(() => server.close());

test("modal keeps its accessible title in the header beside the close control", async () => {
  const window = new Window({ url: "https://mosaik.test/modal" });
  Object.assign(globalThis, {
    document: window.document,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    KeyboardEvent: window.KeyboardEvent,
    MouseEvent: window.MouseEvent,
    Node: window.Node,
    requestAnimationFrame: (callback) => setTimeout(callback, 0),
    cancelAnimationFrame: clearTimeout,
    window,
  });

  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  let closes = 0;
  await act(async () => {
    root.render(React.createElement(Modal, {
      open: true,
      portal: false,
      title: "Delete update",
      metaLabel: "Danger zone",
      closeLabel: "Close dialog",
      onClose: () => { closes += 1; },
    }, "This cannot be undone."));
  });

  const dialog = host.querySelector('[role="dialog"]');
  const header = dialog.querySelector(".mk-dialog-header");
  const title = header?.querySelector(".mk-dialog-title");
  const close = header?.querySelector(".mk-dialog-x");
  assert.ok(header, "the modal exposes a dedicated header");
  assert.equal(title?.textContent, "Delete update");
  assert.equal(close?.getAttribute("aria-label"), "Close dialog");
  assert.equal(dialog.getAttribute("aria-labelledby"), title.id);
  assert.equal(dialog.querySelector(".mk-dialog-body .mk-dialog-title"), null);

  await act(async () => close.click());
  assert.equal(closes, 1);
  await act(async () => root.unmount());
  window.close();
});
