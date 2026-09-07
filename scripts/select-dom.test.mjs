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
  const defaultOpenHtml = renderToString(React.createElement(Select, {
    id: "server-default-open-select",
    defaultOpen: true,
    options: ["Alpha"],
  }));
  assert.match(defaultOpenHtml, /aria-expanded="false"/);
  assert.doesNotMatch(defaultOpenHtml, /aria-controls=/);
  assert.doesNotMatch(defaultOpenHtml, /role="listbox"/);
});

test("mounted Select portals, handles keyboard and selection, tracks context, and closes outside", async () => {
  const window = new Window({ url: "https://mosaik.test" });
  const observed = [];
  const mutationObservers = [];
  const NativeMutationObserver = window.MutationObserver;
  class ResizeObserver {
    constructor(callback) { this.callback = callback; observed.push(this); }
    observe(element) { this.element = element; }
    disconnect() { this.disconnected = true; }
  }
  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
      this.observer = new NativeMutationObserver(callback);
      mutationObservers.push(this);
    }
    observe(target, options) { this.observer.observe(target, options); }
    disconnect() { this.disconnected = true; this.observer.disconnect(); }
  }
  Object.assign(globalThis, {
    document: window.document,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    KeyboardEvent: window.KeyboardEvent,
    MouseEvent: window.MouseEvent,
    MutationObserver,
    Node: window.Node,
    ResizeObserver,
    window,
  });

  const host = document.createElement("div");
  host.className = "dark";
  host.dataset.mkCorner = "trbl";
  host.style.setProperty("--mk-primary", "#123456");
  host.style.fontFamily = "InitialSans";
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
  let triggerRect = { bottom: 144, left: 24, top: 100, width: 220 };
  let rectCalls = 0;
  trigger.getBoundingClientRect = () => { rectCalls += 1; return triggerRect; };
  await act(async () => {
    trigger.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }));
  });
  await act(async () => {
    trigger.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }));
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
  assert.equal(menu.parentElement.style.fontFamily, "InitialSans");
  assert.equal(observed[0].element, trigger);
  assert.equal(menu.style.top, "150px");

  triggerRect = { bottom: 244, left: 30, top: 200, width: 240 };
  await act(async () => observed[0].callback());
  assert.equal(menu.style.top, "250px");
  assert.equal(menu.style.left, "30px");
  assert.equal(menu.style.width, "240px");

  triggerRect = { bottom: 344, left: 31, top: 300, width: 241 };
  await act(async () => window.dispatchEvent(new window.Event("scroll")));
  assert.equal(menu.style.top, "350px");
  triggerRect = { bottom: 444, left: 32, top: 400, width: 242 };
  await act(async () => window.dispatchEvent(new window.Event("resize")));
  assert.equal(menu.style.top, "450px");

  host.classList.remove("dark");
  host.dataset.mkCorner = "tlbr";
  host.style.setProperty("--mk-primary", "#abcdef");
  host.style.fontFamily = "UpdatedSans";
  // HappyDOM does not invalidate inherited computed font styles on this
  // React-created trigger, so mirror the resolved browser value on the trigger.
  trigger.style.fontFamily = host.style.fontFamily;
  await act(async () => await Promise.resolve());
  assert.equal(window.getComputedStyle(trigger).fontFamily, "UpdatedSans");
  // HappyDOM can deliver the ancestor mutation before its inherited computed-font
  // cache is refreshed. Re-run the same observer callback deterministically once
  // synchronous style mutation is complete, as this test does for ResizeObserver.
  await act(async () => mutationObservers.at(-1).callback());
  const refreshedWrapper = document.body.querySelector("[role=listbox]").parentElement;
  assert.equal(refreshedWrapper.className, "");
  assert.equal(refreshedWrapper.dataset.mkCorner, "tlbr");
  assert.equal(refreshedWrapper.style.getPropertyValue("--mk-primary"), "#abcdef");
  assert.equal(refreshedWrapper.style.fontFamily, "UpdatedSans");

  await act(async () => {
    trigger.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));
  });
  assert.deepEqual(changes, [["Charlie"]]);
  assert.equal(document.body.querySelector("[role=listbox]"), null);

  await act(async () => trigger.click());
  await act(async () => document.body.dispatchEvent(new window.MouseEvent("pointerdown", { bubbles: true })));
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(trigger.hasAttribute("aria-controls"), false);
  assert.equal(document.body.querySelector("[role=listbox]"), null);
  assert.equal(observed.every((observer) => observer.disconnected), true);
  assert.equal(mutationObservers.every((observer) => observer.disconnected), true);
  const callsAfterClose = rectCalls;
  await act(async () => {
    window.dispatchEvent(new window.Event("scroll"));
    window.dispatchEvent(new window.Event("resize"));
  });
  assert.equal(rectCalls, callsAfterClose, "window listeners are removed after close");
  await act(async () => root.unmount());

  const multiHost = document.createElement("div");
  document.body.append(multiHost);
  const multiChanges = [];
  const multiRoot = createRoot(multiHost);
  await act(async () => {
    multiRoot.render(React.createElement(Select, {
      id: "multi-select",
      multiple: true,
      onChange: (value) => multiChanges.push(value),
      options: ["Alpha", "Charlie"],
    }));
  });
  const multiTrigger = multiHost.querySelector("[role=combobox]");
  let multiRect = { bottom: 144, left: 40, top: 100, width: 200 };
  multiTrigger.getBoundingClientRect = () => multiRect;
  await act(async () => multiTrigger.click());
  const multiMenu = document.body.querySelector("[role=listbox]");
  await act(async () => multiMenu.querySelector("#multi-select-listbox-option-0").click());
  assert.deepEqual(multiChanges, [["Alpha"]]);
  assert.ok(document.body.querySelector("[role=listbox]"), "multi menu stays open after add");
  multiRect = { bottom: 188, left: 40, top: 100, width: 200 };
  await act(async () => observed.at(-1).callback());
  assert.equal(multiMenu.style.top, "194px", "trigger resize repositions an open multi menu");
  await act(async () => multiMenu.querySelector("#multi-select-listbox-option-0").click());
  assert.deepEqual(multiChanges, [["Alpha"], []]);
  assert.ok(document.body.querySelector("[role=listbox]"), "multi menu stays open after remove");
  await act(async () => multiRoot.unmount());
  assert.equal(observed.every((observer) => observer.disconnected), true);
  assert.equal(mutationObservers.every((observer) => observer.disconnected), true);

  const defaultOpenHost = document.createElement("div");
  document.body.append(defaultOpenHost);
  const defaultOpenChanges = [];
  const defaultOpenRoot = createRoot(defaultOpenHost);
  await act(async () => {
    defaultOpenRoot.render(React.createElement(React.StrictMode, null,
      React.createElement(Select, {
        id: "default-open-select",
        defaultOpen: true,
        "aria-label": "Choose a workspace",
        onChange: (value) => defaultOpenChanges.push(value),
        options: ["Alpha", "Beta"],
      }),
    ));
  });
  const defaultOpenTrigger = defaultOpenHost.querySelector("[role=combobox]");
  const defaultOpenMenu = document.body.querySelector("#default-open-select-listbox");
  assert.ok(defaultOpenMenu, "defaultOpen mounts the listbox in the body portal");
  assert.equal(document.activeElement, defaultOpenTrigger, "defaultOpen focuses the combobox trigger");
  assert.equal(defaultOpenTrigger.getAttribute("aria-expanded"), "true");
  assert.equal(defaultOpenTrigger.getAttribute("aria-activedescendant"), `${defaultOpenMenu.id}-option-0`);
  await act(async () => document.body.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
  assert.equal(
    document.body.querySelector("#default-open-select-listbox") != null,
    true,
    "the trailing click from an external mousedown opener does not close a newly mounted picker",
  );
  await act(async () => {
    defaultOpenTrigger.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));
  });
  assert.deepEqual(defaultOpenChanges, [["Alpha"]]);
  assert.equal(document.body.querySelector("#default-open-select-listbox") === null, true);
  await act(async () => defaultOpenRoot.unmount());

  const edgeHost = document.createElement("div");
  document.body.append(edgeHost);
  const edgeRoot = createRoot(edgeHost);
  await act(async () => {
    edgeRoot.render(React.createElement(Select, {
      key: "disabled",
      id: "disabled-default-open-select",
      defaultOpen: true,
      disabled: true,
      options: ["Alpha"],
    }));
  });
  assert.equal(edgeHost.querySelector("[role=combobox]").getAttribute("aria-expanded"), "false");
  assert.equal(document.body.querySelector("#disabled-default-open-select-listbox") === null, true);
  await act(async () => {
    edgeRoot.render(React.createElement(Select, {
      key: "empty",
      id: "empty-default-open-select",
      defaultOpen: true,
      "aria-label": "Empty picker",
      options: [],
    }));
  });
  const emptyTrigger = edgeHost.querySelector("[role=combobox]");
  assert.equal(emptyTrigger.getAttribute("aria-expanded"), "true");
  assert.equal(emptyTrigger.hasAttribute("aria-activedescendant"), false);
  assert.ok(document.body.querySelector("#empty-default-open-select-listbox"));
  await act(async () => edgeRoot.unmount());
  window.close();
});
