import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";
import React, { act } from "react";
import { renderToString } from "react-dom/server";
import { Window } from "happy-dom";
import { createServer } from "vite";

const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
const { Tabs } = await server.ssrLoadModule("/src/components/tabs/tabs.tsx");
const { getTabPanelProps } = await server.ssrLoadModule("/src/components/tabs/tabs-state.mjs");
after(() => server.close());

let mountedRoot;
let mountedWindow;
afterEach(async () => {
  if (mountedRoot != null) await act(async () => mountedRoot.unmount());
  mountedWindow?.close();
  mountedRoot = undefined;
  mountedWindow = undefined;
});

const ITEMS = [
  { value: "all", label: "All" },
  { value: "owned", label: "Owned" },
  { value: "locked", label: "Locked", disabled: true, focusableDisabled: true },
  { value: "sales", label: "Sales" },
];

/** Controlled Tabs + an external panel wired with getTabPanelProps, like the website pages. */
function Harness({ initial = "all", onChange, ...props }) {
  const [value, setValue] = React.useState(initial);
  return React.createElement(
    "div",
    null,
    React.createElement(Tabs, {
      id: "library-tabs",
      "aria-label": "Library",
      externalPanels: true,
      items: ITEMS,
      value,
      onChange: (next) => {
        setValue(next);
        onChange?.(next);
      },
      ...props,
    }),
    React.createElement("section", getTabPanelProps("library-tabs", value), `Panel ${value}`),
  );
}

async function mount(props = {}) {
  const window = new Window({ url: "https://mosaik.test", width: 390, height: 844 });
  mountedWindow = window;
  Object.assign(globalThis, {
    document: window.document,
    Event: window.Event,
    FocusEvent: window.FocusEvent,
    HTMLElement: window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    KeyboardEvent: window.KeyboardEvent,
    MouseEvent: window.MouseEvent,
    Node: window.Node,
    PointerEvent: window.PointerEvent,
    window,
  });
  const { createRoot } = await import("react-dom/client");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  mountedRoot = root;
  await act(async () => root.render(React.createElement(Harness, props)));
  return { window, host };
}

const key = (window, value) => new window.KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: value });
const tab = (host, value) => host.querySelector(`#library-tabs-tab-${value}`);
const panel = (host) => host.querySelector("[role=tabpanel]");

function assertLinked(host, value) {
  const button = tab(host, value);
  const region = panel(host);
  assert.ok(button, `tab ${value} has a value-based id`);
  assert.equal(button.getAttribute("aria-selected"), "true");
  assert.equal(button.getAttribute("aria-controls"), region.id);
  assert.equal(region.id, `library-tabs-panel-${value}`);
  assert.equal(region.getAttribute("aria-labelledby"), button.id);
  assert.equal(region.getAttribute("tabindex"), "0");
}

test("server render: external panels give every tab a value-based id and aria-controls", () => {
  const html = renderToString(React.createElement(Harness));
  for (const item of ITEMS) {
    assert.match(html, new RegExp(`id="library-tabs-tab-${item.value}"[^>]*aria-controls="library-tabs-panel-${item.value}"`));
  }
  assert.match(html, /<section id="library-tabs-panel-all" role="tabpanel" aria-labelledby="library-tabs-tab-all" tabindex="0">/);
  assert.match(html, /class="mk-tabs-frame"/, "the frame starts without overflow classes (no hydration mismatch)");
  assert.doesNotMatch(html, /mk-tabs-scroll/);
});

test("without externalPanels, tabs keep their index ids and no dangling aria-controls", () => {
  const html = renderToString(React.createElement(Tabs, { id: "plain", items: ITEMS, defaultValue: "all" }));
  assert.match(html, /id="plain-tab-0"/);
  assert.doesNotMatch(html, /aria-controls=/);
});

test("arrow keys, Home and End move focus and selection; the panel follows the active tab", async () => {
  const changes = [];
  const { window, host } = await mount({ onChange: (value) => changes.push(value) });
  assertLinked(host, "all");
  const tabs = [...host.querySelectorAll("[role=tab]")];
  assert.deepEqual(tabs.map((button) => button.getAttribute("tabindex")), ["0", "-1", "-1", "-1"], "one tab stop: the active tab");

  await act(async () => tab(host, "all").focus());
  await act(async () => tab(host, "all").dispatchEvent(key(window, "ArrowRight")));
  assert.equal(document.activeElement, tab(host, "owned"));
  assertLinked(host, "owned");

  await act(async () => tab(host, "owned").dispatchEvent(key(window, "ArrowRight")));
  assert.equal(document.activeElement, tab(host, "locked"), "focusable-disabled tab receives focus");
  assertLinked(host, "owned");

  await act(async () => tab(host, "locked").dispatchEvent(key(window, "End")));
  assert.equal(document.activeElement, tab(host, "sales"));
  assertLinked(host, "sales");

  await act(async () => tab(host, "sales").dispatchEvent(key(window, "Home")));
  assert.equal(document.activeElement, tab(host, "all"));
  assertLinked(host, "all");

  await act(async () => tab(host, "all").dispatchEvent(key(window, "ArrowLeft")));
  assert.equal(document.activeElement, tab(host, "sales"), "ArrowLeft wraps to the last tab");
  assert.deepEqual(changes, ["owned", "sales", "all", "sales"]);
});

function stubMetrics(element, metrics) {
  for (const [name, value] of Object.entries(metrics)) {
    Object.defineProperty(element, name, { configurable: true, get: () => (typeof value === "function" ? value() : value) });
  }
}

test("overflowing tabs show edge buttons that scroll the list, and the active tab is revealed", async () => {
  const { window, host } = await mount();
  const list = host.querySelector("[role=tablist]");
  const frame = host.querySelector(".mk-tabs-frame");
  const scrolls = [];
  let scrollLeft = 0;
  stubMetrics(list, { clientWidth: 300, scrollWidth: 520, scrollLeft: () => scrollLeft });
  list.scrollTo = ({ left }) => {
    scrolls.push(left);
    scrollLeft = left;
    list.dispatchEvent(new window.Event("scroll"));
  };
  ITEMS.forEach((item, index) => stubMetrics(tab(host, item.value), { offsetLeft: index * 130, offsetWidth: 110 }));

  await act(async () => list.dispatchEvent(new window.Event("scroll")));
  assert.match(frame.className, /can-scroll-end/);
  assert.doesNotMatch(frame.className, /can-scroll-start/);
  const end = frame.querySelector(".mk-tabs-scroll.is-end");
  assert.ok(end, "an end button appears when tabs are hidden on the right");
  assert.equal(end.getAttribute("aria-hidden"), "true");
  assert.equal(end.getAttribute("tabindex"), "-1", "scroll buttons stay out of the tab order");
  assert.equal(frame.querySelector(".mk-tabs-scroll.is-start"), null);

  await act(async () => end.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
  assert.equal(scrolls.at(-1), 210, "one press scrolls 70% of the visible width");
  assert.match(frame.className, /can-scroll-start/);

  await act(async () => tab(host, "sales").focus());
  await act(async () => tab(host, "sales").dispatchEvent(key(window, "Home")));
  assert.equal(scrolls.at(-1), 0, "the newly active first tab is scrolled back into view");
  assert.doesNotMatch(frame.className, /can-scroll-start/);
});
