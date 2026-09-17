import assert from "node:assert/strict";
import { after, test } from "node:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Window } from "happy-dom";
import { createServer } from "vite";

const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
const { SegmentedControl } = await server.ssrLoadModule(
  "/src/components/segmented-control/segmented-control.tsx",
);
after(() => server.close());

function setGeometry(element, { left, top = 0, width, height = 32 }) {
  for (const [property, value] of Object.entries({
    offsetLeft: left,
    offsetTop: top,
    offsetWidth: width,
    offsetHeight: height,
  })) {
    Object.defineProperty(element, property, {
      configurable: true,
      get: () => value,
    });
  }
}

test("segmented thumb follows selected and preceding labels when their content changes", async () => {
  const window = new Window({ url: "https://mosaik.test/segmented-control" });
  window.matchMedia = () => ({ matches: false });

  let resizeCallback;
  const observed = new Set();
  class ResizeObserver {
    constructor(callback) {
      resizeCallback = callback;
    }
    observe(element) {
      observed.add(element);
    }
    unobserve(element) {
      observed.delete(element);
    }
    disconnect() {
      observed.clear();
    }
  }

  Object.assign(globalThis, {
    document: window.document,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    Node: window.Node,
    ResizeObserver,
    window,
  });

  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const renderControl = (firstLabel, secondLabel) =>
    React.createElement(SegmentedControl, {
      options: [
        { value: "first", label: firstLabel },
        { value: "second", label: secondLabel },
      ],
      value: "second",
    });

  await act(async () => root.render(renderControl("First", "Second")));
  const buttons = host.querySelectorAll("button");
  const thumb = host.querySelector(".mk-seg-thumb");
  setGeometry(buttons[0], { left: 3, width: 48 });
  setGeometry(buttons[1], { left: 53, width: 64 });

  assert.equal(typeof resizeCallback, "function", "segments register a geometry observer");
  assert.equal(observed.size, 2, "every segment can move the selected pill");
  await act(async () => resizeCallback([]));
  assert.equal(thumb.style.left, "53px");
  assert.equal(thumb.style.width, "64px");

  await act(async () => root.render(renderControl("A much longer first label", "Second")));
  setGeometry(buttons[0], { left: 3, width: 148 });
  setGeometry(buttons[1], { left: 153, width: 64 });
  await act(async () => resizeCallback([]));
  assert.equal(thumb.style.left, "153px", "a preceding label can reposition the selected pill");

  const dirtySelectedLabel = React.createElement(
    "span",
    { className: "inline-flex items-center gap-1" },
    "Second",
    React.createElement("span", {
      className: "h-1.5 w-1.5 rounded-full bg-current",
      "aria-label": "Modified",
    }),
  );
  await act(async () => root.render(renderControl("A much longer first label", dirtySelectedLabel)));
  setGeometry(buttons[1], { left: 153, width: 76 });
  await act(async () => resizeCallback([]));
  assert.equal(thumb.style.width, "76px", "a dirty marker can resize the selected pill");

  await act(async () => root.unmount());
  window.close();
});

test("selection keeps the sliding transition when observed segments rerender", async () => {
  const window = new Window({ url: "https://mosaik.test/segmented-control-motion" });
  window.matchMedia = () => ({ matches: false });

  let observeCalls = 0;
  class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {
      observeCalls += 1;
      queueMicrotask(() => this.callback([]));
    }
    unobserve() {}
    disconnect() {}
  }

  Object.assign(globalThis, {
    document: window.document,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    Node: window.Node,
    ResizeObserver,
    window,
  });

  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const renderControl = (value) => React.createElement(SegmentedControl, {
    options: ["First", "Second"],
    value,
  });

  await act(async () => root.render(renderControl("First")));
  observeCalls = 0;
  await act(async () => root.render(renderControl("Second")));

  const thumb = host.querySelector(".mk-seg-thumb");
  assert.equal(observeCalls, 0, "selection must not re-register unchanged buttons");
  assert.match(thumb.style.transition, /^left \.27s /);
  assert.match(thumb.style.transition, /width \.27s /);

  await act(async () => root.unmount());
  window.close();
});
