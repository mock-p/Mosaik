import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";
import React, { act } from "react";
import { renderToString } from "react-dom/server";
import { Window } from "happy-dom";
import { createServer } from "vite";

const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
const { Definition } = await server.ssrLoadModule("/src/components/definition/definition.tsx");
after(() => server.close());

let mountedRoot;
let mountedWindow;
afterEach(async () => {
  if (mountedRoot != null) await act(async () => mountedRoot.unmount());
  mountedWindow?.close();
  mountedRoot = undefined;
  mountedWindow = undefined;
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function mount(props) {
  const window = new Window({ url: "https://mosaik.test", width: 1024, height: 768 });
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
  const events = { opens: [], parentClicks: 0 };
  await act(async () => {
    root.render(
      React.createElement(
        "div",
        { onClick: () => { events.parentClicks += 1; } },
        "Start your ",
        React.createElement(Definition, {
          title: "Machine",
          content: "The computer that runs your server.",
          action: React.createElement("a", { href: "/glossary#machine" }, "Learn more"),
          onOpenChange: (open) => events.opens.push(open),
          ...props,
        }, "machine"),
        " to play.",
        React.createElement("button", { type: "button", id: "after" }, "Next"),
      ),
    );
  });
  const trigger = host.querySelector(".mk-term");
  return { window, host, trigger, events };
}

const pointer = (window, type, pointerType = "mouse", init = {}) =>
  new window.PointerEvent(type, { bubbles: true, cancelable: true, pointerType, ...init });
const key = (window, value) =>
  new window.KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: value });
const dialog = () => document.body.querySelector("[role=dialog]");

async function press(window, element, pointerType = "mouse") {
  await act(async () => {
    element.dispatchEvent(pointer(window, "pointerdown", pointerType));
    element.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }));
  });
}

test("server render is a dotted term button with a hidden description and no dangling popup ARIA", () => {
  const html = renderToString(React.createElement(Definition, {
    id: "ssr",
    title: "Mock",
    content: "A Minecraft plugin built without code.",
  }, "mock"));
  assert.match(html, /class="mk-term"/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-describedby="ssr-description"/);
  assert.match(html, /<span id="ssr-description" hidden="">A Minecraft plugin built without code\.<\/span>/);
  assert.doesNotMatch(html, /aria-controls=/);
  assert.doesNotMatch(html, /role="dialog"/);
});

test("disabled renders the trigger content as plain text", () => {
  const html = renderToString(React.createElement(Definition, { disabled: true, content: "x" }, "mock"));
  assert.equal(html, "mock");
});

test("tap toggles an interactive, non-modal dialog without triggering parent clicks", async () => {
  const { window, trigger, events } = await mount({ delay: 0 });
  await press(window, trigger, "touch");
  const layer = dialog();
  assert.ok(layer, "dialog is portaled into document.body");
  assert.equal(layer.getAttribute("aria-modal"), "false");
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(trigger.getAttribute("aria-controls"), layer.id);
  assert.equal(layer.getAttribute("aria-labelledby"), layer.querySelector(".mk-float-title span").id);
  assert.match(layer.textContent, /The computer that runs your server\./);
  assert.ok(layer.querySelector(".mk-float-acts a[href='/glossary#machine']"));
  assert.equal(events.parentClicks, 0, "the term click does not bubble to a clickable parent");

  await press(window, trigger, "touch");
  assert.equal(dialog() == null, true);
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.deepEqual(events.opens, [true, false]);
});

test("mouse hover opens after the delay, survives the trip into the popover, and closes after the grace period", async () => {
  const { window, trigger } = await mount({ delay: 20, closeDelay: 30 });
  await act(async () => trigger.dispatchEvent(pointer(window, "pointerover")));
  assert.equal(dialog() == null, true, "hover waits for the delay");
  await act(async () => sleep(40));
  const layer = dialog();
  assert.ok(layer, "hover opened the definition");

  await act(async () => {
    trigger.dispatchEvent(pointer(window, "pointerout", "mouse", { relatedTarget: layer }));
    layer.dispatchEvent(pointer(window, "pointerover", "mouse", { relatedTarget: trigger }));
  });
  await act(async () => sleep(50));
  assert.ok(dialog(), "moving into the popover cancels the close");

  await act(async () => layer.dispatchEvent(pointer(window, "pointerout", "mouse", { relatedTarget: document.body })));
  assert.ok(dialog(), "grace period keeps it open briefly");
  await act(async () => sleep(50));
  assert.equal(dialog() == null, true, "closes once the pointer has left");
});

test("clicking a hover-opened term pins it; outside press closes it", async () => {
  const { window, trigger } = await mount({ delay: 0, closeDelay: 0 });
  await act(async () => trigger.dispatchEvent(pointer(window, "pointerover")));
  assert.ok(dialog());
  await press(window, trigger);
  await act(async () => trigger.dispatchEvent(pointer(window, "pointerout", "mouse", { relatedTarget: document.body })));
  assert.ok(dialog(), "pinned popover ignores pointer leave");
  await act(async () => document.body.dispatchEvent(pointer(window, "pointerdown")));
  assert.equal(dialog() == null, true);
});

test("touch hover is ignored", async () => {
  const { window, trigger } = await mount({ delay: 0 });
  await act(async () => trigger.dispatchEvent(pointer(window, "pointerover", "touch")));
  assert.equal(dialog() == null, true);
});

test("keyboard focus opens immediately, Tab enters the popover, Escape closes and returns focus", async () => {
  const { window, trigger } = await mount({ delay: 500 });
  await act(async () => trigger.focus());
  const layer = dialog();
  assert.ok(layer, "focus opens without waiting for the hover delay");

  await act(async () => trigger.dispatchEvent(key(window, "Tab")));
  const link = layer.querySelector("a");
  assert.ok(document.activeElement === link, "Tab moves into the portaled popover");
  assert.ok(dialog(), "focus inside the popover keeps it open");

  await act(async () => link.dispatchEvent(key(window, "Escape")));
  assert.equal(dialog() == null, true);
  assert.ok(document.activeElement === trigger);
});

test("Tab past the last popover action closes and continues after the term", async () => {
  const { window, trigger } = await mount({ delay: 0 });
  await act(async () => trigger.focus());
  await act(async () => trigger.dispatchEvent(key(window, "Tab")));
  const link = dialog().querySelector("a");
  await act(async () => link.dispatchEvent(key(window, "Tab")));
  assert.equal(dialog() == null, true);
  assert.ok(document.activeElement === document.getElementById("after"));
});

test("Enter and Space toggle, Escape on the trigger closes, and focus leaving closes", async () => {
  const { window, trigger } = await mount({ delay: 0 });
  await act(async () => trigger.focus());
  assert.ok(dialog());
  await act(async () => trigger.dispatchEvent(key(window, "Enter")));
  assert.equal(dialog() == null, true, "Enter closes a focus-opened popover");
  await act(async () => trigger.dispatchEvent(key(window, " ")));
  assert.ok(dialog(), "Space opens it again");
  await act(async () => trigger.dispatchEvent(key(window, "Escape")));
  assert.equal(dialog() == null, true);
  await act(async () => trigger.dispatchEvent(key(window, "Enter")));
  assert.ok(dialog());
  await act(async () => document.getElementById("after").focus());
  assert.equal(dialog() == null, true, "blur out of trigger and popover closes");
});

test("activating the popover action closes it", async () => {
  const { window, trigger } = await mount({ delay: 0 });
  await press(window, trigger);
  const link = dialog().querySelector("a");
  link.addEventListener("click", (event) => event.preventDefault());
  await press(window, link);
  assert.equal(dialog() == null, true);
});
