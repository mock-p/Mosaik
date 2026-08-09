import assert from "node:assert/strict";
import { after, test } from "node:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { Window } from "happy-dom";
import { createServer } from "vite";

const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
const { Select } = await server.ssrLoadModule("/src/components/select/select.tsx");
after(() => server.close());

test("closed Select renders safely on the server without dangling popup ARIA", () => {
  const html = renderToString(React.createElement(Select, {
    id: "server-select",
    options: ["Alpha", "Beta"],
  }));
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /aria-controls=/);
  assert.doesNotMatch(html, /role="listbox"/);
});

test("mounted Select portals, handles keyboard and selection, tracks context, and closes outside", async () => {
  const window = new Window({ url: "https://mosaik.test" });
  const observed = [];
  class ResizeObserver {
    constructor(callback) { this.callback = callback; observed.push(this); }
    observe(element) { this.element = element; }
    disconnect() { this.disconnected = true; }
  }
  Object.assign(globalThis, {
    document: window.document,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    KeyboardEvent: window.KeyboardEvent,
    MouseEvent: window.MouseEvent,
    MutationObserver: window.MutationObserver,
    Node: window.Node,
    ResizeObserver,
    window,
  });

  const host = document.createElement("div");
  host.className = "dark";
  host.dataset.mkCorner = "trbl";
  host.style.setProperty("--mk-primary", "#123456");
  document.body.append(host);
  const changes = [];
  const root = createRoot(host);
  await act(async () => {
    root.render(React.createElement(Select, {
      id: "client-select",
      onChange: (value) => changes.push(value),
      options: ["Alpha", { value: "Beta", disabled: true }, "Charlie"],
    }));
  });

  const trigger = host.querySelector("[role=combobox]");
  trigger.getBoundingClientRect = () => ({ bottom: 144, left: 24, top: 100, width: 220 });
  await act(async () => {
    trigger.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "c" }));
  });

  const menu = document.body.querySelector("[role=listbox]");
  assert.ok(menu, "listbox is mounted in document.body");
  assert.equal(host.contains(menu), false, "listbox escapes the component subtree");
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(trigger.getAttribute("aria-controls"), menu.id);
  assert.equal(trigger.getAttribute("aria-activedescendant"), `${menu.id}-option-2`);
  assert.equal(menu.parentElement.className, "dark");
  assert.equal(menu.parentElement.dataset.mkCorner, "trbl");
  assert.equal(menu.parentElement.style.getPropertyValue("--mk-primary"), "#123456");
  assert.equal(observed[0].element, trigger);

  await act(async () => menu.querySelector("#client-select-listbox-option-2").click());
  assert.deepEqual(changes, [["Charlie"]]);
  assert.equal(document.body.querySelector("[role=listbox]"), null);

  await act(async () => trigger.click());
  host.classList.remove("dark");
  host.dataset.mkCorner = "tlbr";
  host.style.setProperty("--mk-primary", "#abcdef");
  await act(async () => await Promise.resolve());
  const refreshedWrapper = document.body.querySelector("[role=listbox]").parentElement;
  assert.equal(refreshedWrapper.className, "");
  assert.equal(refreshedWrapper.dataset.mkCorner, "tlbr");
  assert.equal(refreshedWrapper.style.getPropertyValue("--mk-primary"), "#abcdef");

  await act(async () => document.body.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(trigger.hasAttribute("aria-controls"), false);
  assert.equal(document.body.querySelector("[role=listbox]"), null);
  assert.equal(observed.every((observer) => observer.disconnected), true);
  await act(async () => root.unmount());
  window.close();
});
