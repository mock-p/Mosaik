import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";
import React, { act } from "react";
import { renderToString } from "react-dom/server";
import { Window } from "happy-dom";
import { createServer } from "vite";

const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
const { Combobox } = await server.ssrLoadModule("/src/components/combobox/combobox.tsx");
after(() => server.close());
let mountedRoot;
let mountedWindow;
afterEach(async () => {
  if (mountedRoot != null) await act(async () => mountedRoot.unmount());
  mountedWindow?.close();
  mountedRoot = undefined;
  mountedWindow = undefined;
});

test("closed Combobox renders safely on the server without dangling popup ARIA", () => {
  const html = renderToString(React.createElement(Combobox, {
    id: "server-combobox",
    options: [{ value: "alpha", label: "Alpha" }],
    "aria-label": "Resource",
  }));
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-autocomplete="list"/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /aria-controls=/);
  assert.doesNotMatch(html, /role="listbox"/);
});

test("mounted Combobox portals options, skips disabled items, selects, and closes on blur", async () => {
  const window = new Window({ url: "https://mosaik.test" });
  mountedWindow = window;
  const observers = [];
  class ResizeObserver {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(element) { this.element = element; }
    disconnect() { this.disconnected = true; }
  }
  class MutationObserver {
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  Object.assign(globalThis, {
    document: window.document,
    Event: window.Event,
    FocusEvent: window.FocusEvent,
    HTMLElement: window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    KeyboardEvent: window.KeyboardEvent,
    MouseEvent: window.MouseEvent,
    MutationObserver,
    Node: window.Node,
    ResizeObserver,
    window,
  });
  window.HTMLElement.prototype.scrollIntoView = () => {};
  const { createRoot } = await import("react-dom/client");

  const host = document.createElement("div");
  host.className = "dark";
  host.dataset.mkCorner = "trbl";
  host.style.setProperty("--mk-primary", "#123456");
  document.body.append(host);
  const changes = [];
  const inputChanges = [];
  const root = createRoot(host);
  mountedRoot = root;
  await act(async () => {
    root.render(React.createElement(Combobox, {
      id: "client-combobox",
      "aria-label": "Resource",
      onChange: (next, option) => changes.push([next, option?.value ?? null]),
      onInputChange: (next) => inputChanges.push(next),
      options: [
        { value: "alpha", label: "Alpha" },
        { value: "beta", label: "Beta", disabled: true },
        { value: "gamma", label: React.createElement("strong", null, "Gamma"), textValue: "Gamma resource" },
      ],
    }));
  });

  const input = host.querySelector("[role=combobox]");
  input.getBoundingClientRect = () => ({ bottom: 144, left: 24, top: 100, width: 220 });
  await act(async () => input.focus());

  const listbox = document.body.querySelector("[role=listbox]");
  assert.ok(listbox, "listbox is mounted in document.body");
  assert.equal(host.contains(listbox), false, "listbox escapes clipped component ancestors");
  assert.equal(input.getAttribute("aria-expanded"), "true");
  assert.equal(input.getAttribute("aria-controls"), listbox.id);
  assert.equal(input.getAttribute("aria-activedescendant"), `${listbox.id}-option-0`);
  assert.equal(listbox.parentElement.parentElement.className, "dark");
  assert.equal(listbox.parentElement.parentElement.dataset.mkCorner, "trbl");
  assert.equal(listbox.parentElement.style.top, "150px");

  await act(async () => {
    input.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }));
  });
  assert.equal(input.getAttribute("aria-activedescendant"), `${listbox.id}-option-2`);
  await act(async () => {
    input.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));
  });
  assert.deepEqual(changes, [["gamma", "gamma"]]);
  assert.deepEqual(inputChanges, ["Gamma resource"]);
  assert.equal(input.value, "Gamma resource");
  assert.equal(document.body.querySelector("[role=listbox]") === null, true);
  assert.equal(input.getAttribute("aria-expanded"), "false");
  assert.equal(input.hasAttribute("aria-controls"), false);

  await act(async () => {
    input.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }));
  });
  assert.equal(input.getAttribute("aria-expanded"), "true");
  await act(async () => {
    input.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "Enter", isComposing: true }));
  });
  assert.deepEqual(changes, [["gamma", "gamma"]], "IME confirmation does not select or submit");
  assert.equal(document.body.querySelector("[role=listbox]") != null, true);

  let parentEscapeCount = 0;
  const dismissParent = () => { parentEscapeCount += 1; };
  document.addEventListener("keydown", dismissParent);
  await act(async () => {
    input.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
  });
  assert.equal(parentEscapeCount, 0, "handled popup Escape does not dismiss a parent overlay");
  assert.equal(document.body.querySelector("[role=listbox]") === null, true);
  document.removeEventListener("keydown", dismissParent);

  await act(async () => {
    input.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }));
  });
  assert.equal(input.getAttribute("aria-expanded"), "true");
  const outside = document.createElement("button");
  document.body.append(outside);
  await act(async () => outside.focus());
  assert.equal(document.body.querySelector("[role=listbox]") === null, true);
  assert.equal(observers.every((observer) => observer.disconnected), true);

  await act(async () => input.focus());
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(input, "");
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
  assert.deepEqual(changes, [["gamma", "gamma"], ["", null]], "empty text clears the selection");

});
