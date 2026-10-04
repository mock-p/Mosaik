import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, afterEach, test } from "node:test";
import React, { act } from "react";
import { renderToString } from "react-dom/server";
import { Window } from "happy-dom";
import { createServer } from "vite";

const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
const { Drawer, DRAWER_DRAG_CLOSE_DISTANCE } = await server.ssrLoadModule("/src/components/drawer/drawer.tsx");
after(() => server.close());

const styles = readFileSync(new URL("../src/components.css", import.meta.url), "utf8");

let mountedRoot;
let mountedWindow;
afterEach(async () => {
  if (mountedRoot != null) await act(async () => mountedRoot.unmount());
  mountedWindow?.close();
  mountedRoot = undefined;
  mountedWindow = undefined;
});

function Harness({ placement, onClosed }) {
  const [open, setOpen] = React.useState(true);
  return React.createElement(
    "div",
    null,
    React.createElement("button", { type: "button", id: "opener", onClick: () => setOpen(true) }, "Open"),
    React.createElement(
      Drawer,
      {
        open,
        placement,
        title: "Create",
        closeLabel: "Close",
        onClose: () => {
          setOpen(false);
          onClosed?.();
        },
      },
      React.createElement("button", { type: "button", id: "first" }, "New mock"),
      React.createElement("button", { type: "button", id: "last" }, "Resource"),
    ),
  );
}

async function mount(props) {
  const window = new Window({ url: "https://mosaik.test", width: 390, height: 844 });
  mountedWindow = window;
  Object.assign(globalThis, {
    document: window.document,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    KeyboardEvent: window.KeyboardEvent,
    MouseEvent: window.MouseEvent,
    Node: window.Node,
    PointerEvent: window.PointerEvent,
    requestAnimationFrame: (callback) => setTimeout(callback, 0),
    cancelAnimationFrame: (handle) => clearTimeout(handle),
    window,
  });
  const { createRoot } = await import("react-dom/client");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  mountedRoot = root;
  await act(async () => root.render(React.createElement(Harness, props)));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 5)));
  return { window, host };
}

const key = (window, value, init = {}) => new window.KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: value, ...init });
const pointer = (window, type, clientY) => new window.PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, button: 0, clientY });

test("the default drawer stays a side panel without a handle", () => {
  const html = renderToString(React.createElement(Drawer, { open: true, title: "Side" }, "Body"));
  assert.match(html, /class="mk-drawer"/);
  assert.doesNotMatch(html, /mk-drawer-handle/);
});

test("placement bottom renders a sheet with a decorative handle", () => {
  const html = renderToString(React.createElement(Drawer, { open: true, title: "Sheet", placement: "bottom", onClose() {} }, "Body"));
  assert.match(html, /class="mk-drawer is-bottom"/);
  assert.match(html, /<div class="mk-drawer-handle" aria-hidden="true">/);
});

test("bottom sheet CSS: content height, 85% of the viewport at most, slides from the bottom", () => {
  assert.match(styles, /\.mk-drawer\.is-bottom\s*\{[^}]*top:\s*auto;[^}]*max-height:[^}]*85%/s);
  assert.match(styles, /\.mk-drawer-root\.fixed \.mk-drawer\.is-bottom\s*\{[^}]*85dvh/s);
  assert.match(styles, /\.mk-drawer\.is-bottom\s*\{[^}]*transform:\s*translateY\(calc\(100% \+ 14px\)\)/s);
  assert.match(styles, /\.mk-drawer-root\.open \.mk-drawer\.is-bottom\s*\{[^}]*transform:\s*none/s);
});

test("bottom sheet keeps the modal contract: focus inside, Tab trapped, Escape closes", async () => {
  let closed = 0;
  const { window, host } = await mount({ placement: "bottom", onClosed: () => { closed += 1; } });
  const sheet = host.querySelector("[role=dialog]");
  assert.equal(sheet.getAttribute("aria-modal"), "true");
  assert.ok(sheet.contains(document.activeElement), "focus moved into the sheet");

  const focusable = [...sheet.querySelectorAll("button")];
  const last = focusable.at(-1);
  await act(async () => last.focus());
  await act(async () => document.dispatchEvent(key(window, "Tab")));
  assert.equal(document.activeElement, focusable[0], "Tab wraps inside the sheet");

  await act(async () => document.dispatchEvent(key(window, "Escape")));
  assert.equal(closed, 1);
  assert.match(host.querySelector(".mk-drawer-root").className, /^mk-drawer-root(?! open)/);
});

test("pulling the handle down far enough closes the sheet; a short pull snaps back", async () => {
  let closed = 0;
  const { window, host } = await mount({ placement: "bottom", onClosed: () => { closed += 1; } });
  const handle = host.querySelector(".mk-drawer-handle");
  const sheet = host.querySelector(".mk-drawer");

  await act(async () => {
    handle.dispatchEvent(pointer(window, "pointerdown", 100));
    handle.dispatchEvent(pointer(window, "pointermove", 130));
  });
  assert.equal(sheet.style.transform, "translateY(30px)");
  assert.match(sheet.className, /is-dragging/);
  await act(async () => handle.dispatchEvent(pointer(window, "pointerup", 130)));
  assert.equal(closed, 0);
  assert.equal(sheet.style.transform, "");
  assert.doesNotMatch(sheet.className, /is-dragging/);

  await act(async () => {
    handle.dispatchEvent(pointer(window, "pointerdown", 100));
    handle.dispatchEvent(pointer(window, "pointermove", 100 + DRAWER_DRAG_CLOSE_DISTANCE + 5));
    handle.dispatchEvent(pointer(window, "pointerup", 100 + DRAWER_DRAG_CLOSE_DISTANCE + 5));
  });
  assert.equal(closed, 1);
});
