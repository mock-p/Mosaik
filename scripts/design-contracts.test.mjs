import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const theme = read("src/theme.css");
const components = read("src/components.css");
const progressSource = read("src/components/progress/progress.tsx");
const linkButtonSource = read("src/components/link-button/link-button.tsx");
const sliderSource = read("src/components/slider/slider.tsx");
const overviewSource = read("src/overview.stories.tsx");
const wizardSource = read("src/components/wizard/wizard.tsx");
const codeBlockSource = read("src/components/code-block/code-block.tsx");
const modalSource = read("src/components/modal/modal.tsx");
const preview = read(".storybook/preview.tsx");
const packageJson = JSON.parse(read("package.json"));

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  assert.match(value, /^[\da-f]{6}$/i, `expected a six-digit hex color, received ${hex}`);
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}

function luminance(hex) {
  const channels = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function mixHex(foreground, foregroundWeight, background) {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  const mixed = fg.map((channel, index) => Math.round(channel * foregroundWeight + bg[index] * (1 - foregroundWeight)));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function cssBlock(selector) {
  const start = theme.indexOf(selector);
  assert.notEqual(start, -1, `missing ${selector} block`);
  const open = theme.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < theme.length; index += 1) {
    if (theme[index] === "{") depth += 1;
    if (theme[index] === "}") depth -= 1;
    if (depth === 0) return theme.slice(open + 1, index);
  }
  assert.fail(`unterminated ${selector} block`);
}

function token(block, name) {
  const match = block.match(new RegExp(`${name}\\s*:\\s*(#[\\da-f]{6})`, "i"));
  assert.ok(match, `missing literal ${name} color`);
  return match[1];
}

function balancedBlocks(source, marker) {
  const blocks = [];
  let cursor = 0;
  while ((cursor = source.indexOf(marker, cursor)) !== -1) {
    const open = source.indexOf("{", cursor);
    let depth = 0;
    for (let index = open; index < source.length; index += 1) {
      if (source[index] === "{") depth += 1;
      if (source[index] === "}") depth -= 1;
      if (depth === 0) {
        blocks.push(source.slice(open + 1, index));
        cursor = index + 1;
        break;
      }
    }
  }
  return blocks;
}

function rulesFor(source, selectorFragment) {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors]) => selectors.includes(selectorFragment))
    .map(([, selectors, declarations]) => ({ selectors: selectors.trim(), declarations }));
}

function exactRulesFor(source, selector) {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors]) => selectors.split(",").some((candidate) => candidate.trim() === selector))
    .map(([, selectors, declarations]) => ({ selectors: selectors.trim(), declarations }));
}

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const url = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    return entry.isDirectory() ? filesBelow(url) : [url];
  });
}

function openingTags(source, component) {
  const tags = [];
  const marker = `<${component}`;
  let cursor = 0;
  while ((cursor = source.indexOf(marker, cursor)) !== -1) {
    let braceDepth = 0;
    let quote = null;
    for (let index = cursor + marker.length; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (char === quote && source[index - 1] !== "\\") quote = null;
      } else if (char === '"' || char === "'" || char === "`") {
        quote = char;
      } else if (char === "{") {
        braceDepth += 1;
      } else if (char === "}") {
        braceDepth -= 1;
      } else if (char === ">" && braceDepth === 0) {
        tags.push(source.slice(cursor, index + 1));
        cursor = index + 1;
        break;
      }
    }
  }
  return tags;
}

function literalProp(source, prop) {
  return source.match(new RegExp(`\\b${prop}\\s*=\\s*["']([^"']+)["']`))?.[1];
}

function metaArgs(source) {
  const start = source.indexOf("args:");
  const end = source.indexOf("argTypes:", start);
  return start === -1 ? "" : source.slice(start, end === -1 ? source.length : end);
}

test("root semantic shape tokens preserve both live corner-axis variables", () => {
  const root = cssBlock(":root");
  for (const name of ["--mk-shape-compact", "--mk-shape-control", "--mk-shape-surface"]) {
    const declaration = root.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1] ?? "";
    const cornerOrder = [...declaration.matchAll(/var\(\s*(--mk-c[12])\s*\)/g)].map((match) => match[1]);
    assert.deepEqual(cornerOrder, ["--mk-c1", "--mk-c2", "--mk-c1", "--mk-c2"], `${name} must map TL/BR to c1 and TR/BL to c2`);
  }
  const flipped = cssBlock('[data-mk-corner="trbl"]');
  assert.match(flipped, /--mk-c1\s*:\s*var\(\s*--mk-r-small\s*\)/, "trbl no longer flips c1 to the small corner");
  assert.match(flipped, /--mk-c2\s*:\s*var\(\s*--mk-r-big\s*\)/, "trbl no longer flips c2 to the big corner");
});

test("secondary and warning text meet 4.5:1 on intended surfaces in both themes", () => {
  for (const selector of [":root", ".dark"]) {
    const themeBlock = cssBlock(selector);
    const checks = [
      ["--mk-secondary-text", "--mk-field-bg"],
      ["--mk-warning-text", "--mk-field-bg"],
      ["--mk-warning-text", "--mk-surface-2"],
    ];
    for (const [foreground, background] of checks) {
      const ratio = contrast(token(themeBlock, foreground), token(themeBlock, background));
      assert.ok(ratio >= 4.5, `${selector} ${foreground} on ${background} is ${ratio.toFixed(2)}:1; expected at least 4.5:1`);
    }
  }
});

test("syntax key and string colors meet 4.5:1 on tooltip backgrounds in both themes", () => {
  for (const selector of [":root", ".dark"]) {
    const themeBlock = cssBlock(selector);
    for (const foreground of ["--mk-syntax-key", "--mk-syntax-string"]) {
      const ratio = contrast(token(themeBlock, foreground), token(themeBlock, "--mk-tooltip-bg"));
      assert.ok(ratio >= 4.5, `${selector} ${foreground} on --mk-tooltip-bg is ${ratio.toFixed(2)}:1; expected at least 4.5:1`);
    }
  }
});

test("strong interactive borders meet 3:1 on normal surfaces in both themes", () => {
  for (const [selector, surface] of [[":root", "--mk-field-bg"], [".dark", "--mk-surface"]]) {
    const block = cssBlock(selector);
    const ratio = contrast(token(block, "--mk-border-strong"), token(block, surface));
    assert.ok(ratio >= 3, `${selector} --mk-border-strong is ${ratio.toFixed(2)}:1; expected at least 3:1`);
  }
});

test("solid danger colors keep normal-text contrast and drive the danger button fill", () => {
  for (const selector of [":root", ".dark"]) {
    const themeBlock = cssBlock(selector);
    const ratio = contrast(token(themeBlock, "--mk-on-solid"), token(themeBlock, "--mk-danger-solid"));
    assert.ok(ratio >= 4.5, `${selector} --mk-on-solid on --mk-danger-solid is ${ratio.toFixed(2)}:1; expected at least 4.5:1`);
  }
  const dangerButton = exactRulesFor(components, ".mk-btn-danger");
  assert.ok(dangerButton.some(({ declarations }) => /--mk-fill\s*:\s*var\(\s*--mk-danger-solid\s*\)/.test(declarations)), ".mk-btn-danger fill must use --mk-danger-solid");
});

test("light success text meets 4.5:1 on tinted badges and the audited near-white surface", () => {
  const light = cssBlock(":root");
  const success = token(light, "--mk-success");
  const field = token(light, "--mk-field-bg");
  const tintedBadge = mixHex(success, 0.13, field);
  for (const [surface, background] of [["13% success badge tint", tintedBadge], ["audited #fbfbfe surface", "#fbfbfe"]]) {
    const ratio = contrast(success, background);
    assert.ok(ratio >= 4.5, `--mk-success on ${surface} is ${ratio.toFixed(2)}:1; expected at least 4.5:1`);
  }
});

test("danger text meets 4.5:1 on its 12% badge tint in both themes", () => {
  for (const selector of [":root", ".dark"]) {
    const themeBlock = cssBlock(selector);
    const danger = token(themeBlock, "--mk-danger");
    const field = token(themeBlock, "--mk-field-bg");
    const tintedBadge = mixHex(danger, 0.12, field);
    const ratio = contrast(danger, tintedBadge);
    assert.ok(ratio >= 4.5, `${selector} --mk-danger on its 12% field-bg tint is ${ratio.toFixed(2)}:1; expected at least 4.5:1`);
  }
});

test("code header tooltip-text mix meets 4.5:1 on tooltip backgrounds in both themes", () => {
  const codeHead = exactRulesFor(components, ".mk-code-head");
  const percentage = codeHead
    .map(({ declarations }) => declarations.match(/color\s*:\s*color-mix\(\s*in\s+srgb\s*,\s*var\(\s*--mk-tooltip-text\s*\)\s*([\d.]+)%\s*,\s*transparent\s*\)/)?.[1])
    .find(Boolean);
  assert.ok(percentage, ".mk-code-head must declare a tooltip-text percentage mixed with transparent");
  const weight = Number(percentage) / 100;
  for (const selector of [":root", ".dark"]) {
    const themeBlock = cssBlock(selector);
    const foreground = mixHex(token(themeBlock, "--mk-tooltip-text"), weight, token(themeBlock, "--mk-tooltip-bg"));
    const ratio = contrast(foreground, token(themeBlock, "--mk-tooltip-bg"));
    assert.ok(ratio >= 4.5, `${selector} .mk-code-head ${percentage}% tooltip-text mix is ${ratio.toFixed(2)}:1; expected at least 4.5:1`);
  }
});

test("component radii consume semantic shape tokens instead of corner arithmetic", () => {
  for (const name of ["--mk-shape-compact", "--mk-shape-control", "--mk-shape-surface"]) {
    assert.match(components, new RegExp(`border-radius\\s*:[^;]*var\\(${name}\\)`, "s"), `no border radius consumes ${name}`);
  }
  assert.doesNotMatch(components, /border-radius\s*:[^;]*calc\(var\(--mk-c[12]\)/s, "border radii still use arbitrary corner multipliers");
});

test("audited component motion is disabled by one systemic reduced-motion block", () => {
  const blocks = balancedBlocks(components, "@media (prefers-reduced-motion: reduce)");
  assert.equal(blocks.length, 1, "expected exactly one systemic reduced-motion block");
  const reduced = blocks[0];
  const expectations = [
    [".mk-btn .mk-spinner", /animation\s*:\s*none/],
    [".mk-btn", /transition(?:-duration)?\s*:/],
    [".mk-tooltip-layer", /animation\s*:\s*none/],
    [".mk-seg-thumb.moving", /animation\s*:\s*none/],
    [".mk-progress-fill", /(?:animation\s*:\s*none|transition(?:-duration)?\s*:)/],
    [".mk-spin svg", /animation\s*:\s*none/],
    [".mk-sk::after", /animation\s*:\s*none/],
    [".mk-toast", /(?:animation\s*:\s*none|transition(?:-duration)?\s*:)/],
    [".mk-toast-progress", /animation\s*:\s*none/],
    [".mk-toast.anim-slide", /transition\s*:\s*none\s*!important/],
    [".mk-toast.anim-bounce", /transition\s*:\s*none\s*!important/],
    [".mk-toast.anim-unfold", /transition\s*:\s*none\s*!important/],
    [".mk-toast.out", /transition\s*:\s*none\s*!important/],
    [".mk-acc-body", /transition(?:-duration)?\s*:/],
    [".mk-acc-head .tri", /transition(?:-duration)?\s*:/],
    [".mk-drawer", /transition(?:-duration)?\s*:/],
    [".mk-drawer-scrim", /transition(?:-duration)?\s*:/],
    [".mk-wiz-dot", /transition\s*:\s*none/],
  ];
  for (const [selector, neutralization] of expectations) {
    const rules = exactRulesFor(reduced, selector);
    assert.ok(rules.length > 0, `reduced-motion block does not target exact selector ${selector}`);
    assert.ok(rules.some(({ declarations }) => neutralization.test(declarations)), `${selector} lacks a real motion neutralization`);
  }
});

test("fixed grids keep declared column counts and auto-fit stays opt-in", () => {
  for (const count of [2, 3, 4]) {
    const rules = exactRulesFor(components, `.mk-grid-${count}`);
    assert.ok(rules.some(({ declarations }) => new RegExp(`grid-template-columns\\s*:\\s*repeat\\(\\s*${count}\\s*,\\s*minmax\\(\\s*0\\s*,\\s*1fr\\s*\\)\\s*\\)`).test(declarations)), `.mk-grid-${count} no longer preserves ${count} columns`);
    assert.ok(rules.every(({ declarations }) => !/auto-fit/.test(declarations)), `.mk-grid-${count} must not use auto-fit`);
  }
  const autoRules = exactRulesFor(components, ".mk-grid-auto");
  assert.ok(autoRules.some(({ declarations }) => /grid-template-columns\s*:\s*repeat\(\s*auto-fit\s*,/.test(declarations)), ".mk-grid-auto must own auto-fit behavior");
});

test("every button interaction selector excludes native, class, and aria disabled states", () => {
  const interactiveSelectors = [...components.matchAll(/([^{}]+)\{[^{}]*\}/g)]
    .flatMap(([, selectorList]) => selectorList.split(","))
    .map((selector) => selector.trim())
    .filter((selector) => /\.mk-btn(?:[.:[-]|$)/.test(selector) && /(?::hover|\.is-hover|:active|\.is-active)/.test(selector));
  assert.ok(interactiveSelectors.length > 0, "no interactive button selectors found");
  for (const selector of interactiveSelectors) {
    assert.match(selector, /:not\(\s*:disabled\s*\)/, `${selector} does not exclude :disabled`);
    assert.match(selector, /:not\(\s*\.is-disabled\s*\)/, `${selector} does not exclude .is-disabled`);
    assert.match(selector, /:not\(\s*\[aria-disabled\s*=\s*["']true["']\]\s*\)/, `${selector} does not exclude aria-disabled=true`);
  }
});

test("button fill uses a real transform-driven pseudo-element and no background-size rules", () => {
  const buttonRules = rulesFor(components, ".mk-btn");
  assert.ok(buttonRules.length > 0, "missing button CSS rules");
  for (const { selectors, declarations } of buttonRules) {
    assert.doesNotMatch(declarations, /background-size\s*:/, `${selectors} still declares background-size`);
    assert.doesNotMatch(declarations, /transition\s*:[^}]*\bbackground-size\b/, `${selectors} still animates background-size`);
  }
  const pseudoRules = buttonRules.filter(({ selectors }) => /\.mk-btn::(?:before|after)/.test(selectors));
  assert.ok(pseudoRules.some(({ declarations }) => /transform\s*:\s*scale/.test(declarations) && /transition\s*:[^}]*\btransform\b/.test(declarations)), "button fill pseudo-element is not transform-driven");
  const hoverPseudoRules = buttonRules.filter(({ selectors }) => /\.mk-btn(?::hover|\.is-hover)[^,{]*::(?:before|after)/.test(selectors));
  assert.ok(hoverPseudoRules.some(({ declarations }) => /transform\s*:\s*scale/.test(declarations)), "button hover does not transform the fill pseudo-element");
});

test("determinate progress exposes a scale variable and transitions .mk-progress-fill transform", () => {
  const progressFillJsx = progressSource.match(/<div\s+[\s\S]*?className=\{cx\("mk-progress-fill"[\s\S]*?\/>/)?.[0] ?? "";
  assert.ok(progressFillJsx, "could not find the mk-progress-fill JSX element");
  assert.doesNotMatch(progressFillJsx, /\bwidth\s*:/, "Progress still writes width on mk-progress-fill");
  assert.match(progressFillJsx, /["']--mk-[\w-]+["']\s*:/, "Progress does not expose a quoted CSS custom property for determinate scale");
  const progressRules = rulesFor(components, ".mk-progress-fill");
  assert.ok(progressRules.some(({ declarations }) => /transform\s*:\s*scaleX\(var\(--mk-[\w-]+\)\)/.test(declarations)), "determinate .mk-progress-fill does not use its CSS variable with scaleX");
  assert.ok(progressRules.some(({ declarations }) => /transition\s*:[^}]*\btransform\b/.test(declarations)), ".mk-progress-fill does not transition transform");
  for (const { selectors, declarations } of progressRules) {
    assert.doesNotMatch(declarations, /transition\s*:[^}]*\bwidth\b/, `${selectors} still transitions width`);
  }
});

test("Progress normalizes finite values once and reuses the result consistently", () => {
  assert.equal((progressSource.match(/Number\.isFinite\s*\(/g) ?? []).length, 1, "Progress must have one finite-value normalization path");
  const normalization = progressSource.match(/const\s+(\w+)\s*=\s*Number\.isFinite\(\s*value\s*\)\s*\?\s*Math\.min\(\s*100\s*,\s*Math\.max\(\s*0\s*,\s*value\s*\)\s*\)\s*:\s*0\s*;/);
  assert.ok(normalization, "Progress must clamp finite values to 0..100 and map non-finite values to 0");
  const normalized = normalization[1];
  assert.match(progressSource, new RegExp(`aria-valuenow=\\{\\s*indeterminate\\s*\\?\\s*undefined\\s*:\\s*${normalized}\\s*\\}`), "aria-valuenow does not reuse the normalized value or clear for indeterminate progress");
  assert.match(progressSource, new RegExp(`["']--mk-progress-scale["']\\s*:\\s*${normalized}\\s*\\/\\s*100`), "scale does not reuse the normalized value");
  assert.match(progressSource, new RegExp("`\\$\\{" + normalized + "\\}\\s*%`"), "default readout does not reuse the normalized value");
});

test("Progress always has a non-overridable accessible name", () => {
  const parameters = progressSource.slice(progressSource.indexOf("function Progress("), progressSource.indexOf("ref,", progressSource.indexOf("function Progress(")));
  const ariaLabel = parameters.match(/["']aria-label["']\s*:\s*(\w+)/)?.[1];
  const ariaLabelledby = parameters.match(/["']aria-labelledby["']\s*:\s*(\w+)/)?.[1];
  assert.ok(ariaLabel, "Progress must extract aria-label before ...rest");
  assert.ok(ariaLabelledby, "Progress must extract aria-labelledby before ...rest");
  const labelId = progressSource.match(/const\s+(\w+)\s*=\s*React\.useId\(\)/)?.[1];
  assert.ok(labelId, "Progress must create a stable id for its rendered label");
  assert.match(progressSource, new RegExp(`<span\\s+id=\\{${labelId}\\}[^>]*>\\s*\\{label\\}`), "Progress rendered label must expose the stable id");
  const root = openingTags(progressSource, "div")[0] ?? "";
  assert.ok(root.includes('role="progressbar"'), "Progress root progressbar was not found");
  const spreadIndex = root.indexOf("{...rest}");
  assert.ok(spreadIndex >= 0, "Progress must continue forwarding rest props");
  for (const attribute of ["aria-label=", "aria-labelledby="]) {
    assert.ok(root.indexOf(attribute) > spreadIndex, `Progress final ${attribute.slice(0, -1)} must be applied after {...rest}`);
  }
  assert.match(progressSource, new RegExp(`\\blabel\\b[\\s\\S]{0,160}\\b${labelId}\\b`), "Progress label must select its generated labelled-by id");
  assert.match(progressSource, new RegExp(`\\b${ariaLabelledby}\\b`), "Progress must preserve caller aria-labelledby");
  assert.match(progressSource, new RegExp(`\\b${ariaLabel}\\b`), "Progress must preserve caller aria-label");
  assert.match(progressSource, /["']Progress["']/, "Progress must provide an accessible-name fallback when no label is supplied");
});

test("Slider associates its rendered label and supplies a non-overridable fallback name", () => {
  const parameters = sliderSource.slice(sliderSource.indexOf("function Slider("), sliderSource.indexOf("ref,", sliderSource.indexOf("function Slider(")));
  const ariaLabel = parameters.match(/["']aria-label["']\s*:\s*(\w+)/)?.[1];
  const ariaLabelledby = parameters.match(/["']aria-labelledby["']\s*:\s*(\w+)/)?.[1];
  assert.ok(ariaLabel, "Slider must extract aria-label before ...rest");
  assert.ok(ariaLabelledby, "Slider must extract aria-labelledby before ...rest");
  assert.match(sliderSource, /React\.useId\(\)/, "Slider must create a stable id");
  const inputId = sliderSource.match(/const\s+(\w+)\s*=\s*(?:id\s*\?\?|[^;]*useId[^;]*);/)?.[1];
  assert.ok(inputId, "Slider must derive an input id from the id prop or useId");
  assert.match(sliderSource, new RegExp(`<label\\s+[^>]*htmlFor=\\{${inputId}\\}`), "Slider rendered label must be a label associated with the input id");
  const input = openingTags(sliderSource, "input")[0] ?? "";
  const spreadIndex = input.indexOf("{...rest}");
  assert.ok(spreadIndex >= 0, "Slider must continue forwarding rest input props");
  for (const attribute of ["id=", "aria-label=", "aria-labelledby="]) {
    assert.ok(input.indexOf(attribute) > spreadIndex, `Slider final ${attribute.slice(0, -1)} must be applied after {...rest}`);
  }
  assert.match(sliderSource, new RegExp(`\\b${ariaLabel}\\b`), "Slider must preserve caller aria-label");
  assert.match(sliderSource, new RegExp(`\\b${ariaLabelledby}\\b`), "Slider must preserve caller aria-labelledby");
  assert.match(sliderSource, /["']Slider["']/, "Slider must provide an aria-label fallback when no label or aria-labelledby exists");
});

test("Overview mk-example roots use the main landmark", () => {
  assert.doesNotMatch(overviewSource, /<div\s+className=["']mk-example["']/, "mk-example root must not be a generic div");
  const roots = openingTags(overviewSource, "main").filter((tag) => /className=["']mk-example["']/.test(tag));
  assert.ok(roots.length >= 2, "ExampleShell and Overview roots must both use <main className=\"mk-example\">");
});

test("Overview section numbers use dark-safe tonal text", () => {
  const secNum = overviewSource.match(/const\s+secNum\b[\s\S]*?=\s*\{([\s\S]*?)\n\};/)?.[1] ?? "";
  assert.ok(secNum, "Overview secNum style object was not found");
  assert.match(secNum, /color\s*:\s*["']var\(\s*--mk-tonal-text\s*\)["']/, "Overview secNum color must use var(--mk-tonal-text)");
  assert.doesNotMatch(secNum, /color\s*:\s*["']var\(\s*--mk-primary\s*\)["']/, "Overview secNum must not use dark-insufficient --mk-primary");
});

test("scrollable Wizard is keyboard-focusable and preserves caller tabIndex", () => {
  const parameters = wizardSource.slice(wizardSource.indexOf("function Wizard("), wizardSource.indexOf(") {", wizardSource.indexOf("function Wizard(")));
  assert.match(parameters, /\btabIndex\b/, "Wizard must extract caller tabIndex before ...rest");
  const root = openingTags(wizardSource, "div").find((tag) => /mk-wiz/.test(tag)) ?? "";
  const spreadIndex = root.indexOf("{...rest}");
  const tabIndexIndex = root.indexOf("tabIndex=");
  assert.ok(spreadIndex >= 0 && tabIndexIndex > spreadIndex, "Wizard must apply effective tabIndex after {...rest}");
  const expression = root.match(/tabIndex=\{([^}]+)\}/)?.[1] ?? "";
  assert.match(expression, /\btabIndex\b/, "Wizard effective tabIndex must preserve caller input");
  assert.match(expression, /\?\?\s*0\b/, "Wizard must default tabIndex to 0");
  const focus = exactRulesFor(components, ".mk-wiz:focus-visible");
  assert.ok(focus.some(({ declarations }) => /(?:outline|box-shadow)\s*:/.test(declarations)), ".mk-wiz:focus-visible must have an explicit outline or focus ring");
});

test("scrollable CodeBlock pre is focusable, named, and visibly focused", () => {
  const pre = openingTags(codeBlockSource, "pre")[0] ?? "";
  assert.ok(pre, "CodeBlock pre element was not found");
  assert.match(pre, /tabIndex=\{?0\}?/, "CodeBlock pre must use tabIndex=0");
  const hasAriaLabel = /aria-label=\{[^}]+\}/.test(pre);
  const hasAriaLabelledby = /aria-labelledby=\{[^}]+\}/.test(pre);
  assert.ok(hasAriaLabel || hasAriaLabelledby, "CodeBlock pre must have aria-label or aria-labelledby");
  assert.match(codeBlockSource, /["']Code(?: block)?["']/i, "CodeBlock pre must provide an accessible-name fallback when title cannot name it");
  if (hasAriaLabel) assert.match(pre, /aria-label=\{[^}]*(?:title|preLabel|codeLabel)[^}]*\}/, "CodeBlock pre aria-label must use its title/label before falling back");
  if (hasAriaLabelledby) assert.match(codeBlockSource, /React\.useId\(\)/, "CodeBlock aria-labelledby must reference a stable generated id");
  const focus = exactRulesFor(components, ".mk-code pre:focus-visible");
  assert.ok(focus.some(({ declarations }) => /(?:outline|box-shadow)\s*:/.test(declarations)), ".mk-code pre:focus-visible must have an explicit outline or focus ring");
});

test("scrollable Modal body is keyboard-focusable and visibly focused", () => {
  const body = openingTags(modalSource, "div").find((tag) => /className=["']mk-dialog-body["']/.test(tag)) ?? "";
  assert.ok(body, "Modal .mk-dialog-body element was not found");
  assert.match(body, /tabIndex=\{?0\}?/, "Modal .mk-dialog-body must use a non-overridable tabIndex=0");
  const spreadIndex = body.indexOf("{...rest}");
  const tabIndexIndex = body.indexOf("tabIndex=");
  assert.ok(spreadIndex === -1 || tabIndexIndex > spreadIndex, "Modal body tabIndex must not be overridable by spread props");
  const focus = exactRulesFor(components, ".mk-dialog-body:focus-visible");
  assert.ok(focus.some(({ declarations }) => /(?:outline|box-shadow)\s*:/.test(declarations)), ".mk-dialog-body:focus-visible must have an explicit outline or focus ring");
});

test("compact overlays retain usable controls and narrow-content safeguards", () => {
  const toastClose = exactRulesFor(components, ".mk-toast-x");
  assert.ok(toastClose.some(({ declarations }) => /(?:min-)?width\s*:\s*(?:2[4-9]|[3-9]\d)px/.test(declarations)), ".mk-toast-x width must be at least 24px");
  assert.ok(toastClose.some(({ declarations }) => /(?:min-)?height\s*:\s*(?:2[4-9]|[3-9]\d)px/.test(declarations)), ".mk-toast-x height must be at least 24px");
  assert.ok(exactRulesFor(components, ".mk-cmdk-search input").some(({ declarations }) => /min-width\s*:\s*0\b/.test(declarations)), ".mk-cmdk-search input must allow intrinsic shrinking");
  assert.ok(exactRulesFor(components, ".mk-float").some(({ declarations }) => /max-width\s*:[^;]*(?:100%|100vw)/.test(declarations)), ".mk-float must be viewport/container bounded");
  assert.ok(exactRulesFor(components, ".mk-float.tip").some(({ declarations }) => /white-space\s*:\s*normal/.test(declarations)), ".mk-float tip content must wrap");
});

test("tag dismiss control has a 24px target and visible keyboard focus", () => {
  const tagClose = exactRulesFor(components, ".mk-tag-x");
  assert.ok(tagClose.some(({ declarations }) => /(?:min-)?width\s*:\s*(?:2[4-9]|[3-9]\d)px/.test(declarations)), ".mk-tag-x effective width must be at least 24px");
  assert.ok(tagClose.some(({ declarations }) => /(?:min-)?height\s*:\s*(?:2[4-9]|[3-9]\d)px/.test(declarations)), ".mk-tag-x effective height must be at least 24px");
  const focusRules = exactRulesFor(components, ".mk-tag-x:focus-visible");
  assert.ok(focusRules.some(({ declarations }) => /(?:outline|box-shadow)\s*:/.test(declarations)), ".mk-tag-x:focus-visible must have an explicit outline or focus ring");
});

test("LinkButton prevents disabled aria state from being overridden by rest props", () => {
  const parameters = linkButtonSource.slice(linkButtonSource.indexOf("function LinkButton("), linkButtonSource.indexOf("ref,", linkButtonSource.indexOf("function LinkButton(")));
  const ariaAlias = parameters.match(/["']aria-disabled["']\s*:\s*(\w+)/)?.[1];
  assert.ok(ariaAlias, "LinkButton must extract aria-disabled from incoming props");
  assert.ok(parameters.indexOf(`...rest`) > parameters.search(/["']aria-disabled["']\s*:/), "LinkButton must remove aria-disabled before collecting rest props");
  const anchor = openingTags(linkButtonSource, "a")[0] ?? "";
  assert.ok(anchor, "LinkButton anchor element was not found");
  const spreadIndex = anchor.indexOf("{...rest}");
  const ariaIndex = anchor.indexOf("aria-disabled=");
  assert.ok(spreadIndex >= 0 && ariaIndex > spreadIndex, "LinkButton must apply computed aria-disabled after {...rest}");
  const bodyStart = linkButtonSource.indexOf(") {", linkButtonSource.indexOf("function LinkButton("));
  const preReturnBody = linkButtonSource.slice(bodyStart + 3, linkButtonSource.indexOf("return (", bodyStart));
  const effectiveMatch = preReturnBody.match(/const\s+(\w+)\s*=\s*([^;]*(?:\bdisabled\b[^;]*\bariaDisabled\b|\bariaDisabled\b[^;]*\bdisabled\b)[^;]*);/);
  assert.ok(effectiveMatch, "LinkButton must derive effectiveDisabled from disabled and incoming aria-disabled");
  const effective = effectiveMatch[1];
  assert.match(effectiveMatch[2], /\bdisabled\b/, "effectiveDisabled must include disabled");
  assert.match(effectiveMatch[2], new RegExp(`\\b${ariaAlias}\\b`), "effectiveDisabled must include incoming aria-disabled");
  const ariaExpression = anchor.match(/aria-disabled=\{([^}]+)\}/)?.[1] ?? "";
  assert.match(ariaExpression, new RegExp(`\\b${effective}\\b`), "final aria-disabled must use effectiveDisabled");
  assert.doesNotMatch(ariaExpression, new RegExp(`\\b(?:disabled|${ariaAlias})\\b`), "final aria-disabled must not recompute from raw disabled inputs");
});

test("LinkButton derives every disabled behavior from one effective disabled state", () => {
  const bodyStart = linkButtonSource.indexOf(") {", linkButtonSource.indexOf("function LinkButton("));
  const preReturnBody = linkButtonSource.slice(bodyStart + 3, linkButtonSource.indexOf("return (", bodyStart));
  const effectiveMatch = preReturnBody.match(/const\s+(\w+)\s*=\s*([^;]*(?:\bdisabled\b[^;]*\bariaDisabled\b|\bariaDisabled\b[^;]*\bdisabled\b)[^;]*);/);
  assert.ok(effectiveMatch, "LinkButton must derive one effectiveDisabled value from disabled and aria-disabled");
  const effective = effectiveMatch[1];
  const expression = effectiveMatch[2];
  assert.match(expression, /\bdisabled\b/, "effectiveDisabled must include disabled");
  assert.match(expression, /\bariaDisabled\b/, "effectiveDisabled must include incoming aria-disabled");
  const anchor = openingTags(linkButtonSource, "a")[0] ?? "";
  assert.match(anchor, new RegExp(`href=\\{${effective}\\s*\\?\\s*undefined\\s*:`), "LinkButton must remove href from effectiveDisabled");
  assert.match(anchor, new RegExp(`tabIndex=\\{${effective}\\s*\\?\\s*-1\\s*:`), "LinkButton must set tabIndex -1 from effectiveDisabled");
  assert.match(anchor, new RegExp(`aria-disabled=\\{${effective}\\s*(?:\\|\\|\\s*undefined)?\\}`), "LinkButton must expose aria-disabled from effectiveDisabled");
  assert.match(anchor, new RegExp(`${effective}\\s*&&\\s*["']is-disabled["']`), "LinkButton must add is-disabled from effectiveDisabled");
  assert.match(anchor, new RegExp(`if\\s*\\(\\s*${effective}\\s*\\)\\s*\\{[\\s\\S]*?preventDefault\\(`), "LinkButton must prevent click navigation from effectiveDisabled");
});

test("Progress and Slider treat blank ARIA naming strings as absent", () => {
  for (const [name, source, rootTag, fallback] of [
    ["Progress", progressSource, "div", "Progress"],
    ["Slider", sliderSource, "input", "Value"],
  ]) {
    const normalizedLabel = source.match(/const\s+(\w+)\s*=\s*[^;\n]*\bariaLabel\b[^;\n]*\.trim\(\)[^;\n]*;/)?.[1];
    const normalizedLabelledby = source.match(/const\s+(\w+)\s*=\s*[^;\n]*\bariaLabelledby\b[^;\n]*\.trim\(\)[^;\n]*;/)?.[1];
    assert.ok(normalizedLabel, `${name} must trim aria-label so empty/whitespace strings are absent`);
    assert.ok(normalizedLabelledby, `${name} must trim aria-labelledby so empty/whitespace strings are absent`);
    const root = openingTags(source, rootTag).find((tag) => name === "Slider" || /role=["']progressbar["']/.test(tag)) ?? "";
    const ariaLabelExpression = root.match(/aria-label=\{([^}]+)\}/)?.[1] ?? "";
    const ariaLabelledbyExpression = root.match(/aria-labelledby=\{([^}]+)\}/)?.[1] ?? "";
    assert.match(ariaLabelExpression, new RegExp(`\\b${normalizedLabel}\\b`), `${name} final aria-label must use the trimmed value`);
    assert.match(ariaLabelledbyExpression, new RegExp(`\\b${normalizedLabelledby}\\b`), `${name} final aria-labelledby must use the trimmed value`);
    assert.match(ariaLabelExpression, new RegExp(`["']${fallback}["']`), `${name} must fall back when both ARIA naming strings are blank`);
  }
});

test("Storybook loads local preview fonts and uses responsive full-width docs", () => {
  assert.match(preview, /@fontsource-variable\/parkinsans/, "preview does not import local Parkinsans");
  assert.match(preview, /@fontsource-variable\/dm-sans/, "preview does not import local DM Sans");
  assert.match(preview, /width:\s*["']100%["']/, "docs wrapper is not full width");
  assert.match(preview, /minWidth:\s*0/, "docs wrapper does not permit intrinsic shrinking");
  assert.match(preview, /padding:\s*["']clamp\(/, "preview padding is not responsive");
});

test("Storybook preview maps consumer font tokens to Fontsource variable family names", () => {
  const expected = [
    ["--mk-font-display", '"Parkinsans Variable", sans-serif'],
    ["--mk-font-btn", '"Parkinsans Variable", sans-serif'],
    ["--mk-font-ui", '"DM Sans Variable", sans-serif'],
  ];
  for (const [property, family] of expected) {
    const propertyPattern = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const familyPattern = family.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
    assert.match(preview, new RegExp(`["']?${propertyPattern}["']?\\s*:\\s*["']${familyPattern}["']`), `preview must override ${property} to ${family}`);
  }
});

test("all direct Storybook dependencies are pinned exactly to 8.6.18", () => {
  const entries = Object.entries(packageJson.devDependencies)
    .filter(([name]) => name === "storybook" || name.startsWith("@storybook/"));
  assert.ok(entries.length > 0, "no direct Storybook dependencies found");
  for (const [name, version] of entries) {
    assert.equal(version, "8.6.18", `${name} must be pinned exactly to 8.6.18`);
  }
});

test("Kbd, LinkButton, and Typography have dedicated stories", () => {
  for (const path of [
    "src/components/kbd/kbd.stories.tsx",
    "src/components/link-button/link-button.stories.tsx",
    "src/components/typography/typography.stories.tsx",
  ]) {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `missing dedicated story: ${path}`);
  }
});

test("Storybook stories and MDX use English visible copy", () => {
  const src = new URL("../src/", import.meta.url);
  const files = filesBelow(src).filter((url) => /(?:\.stories\.tsx|\.mdx)$/.test(url.pathname));
  const relativePaths = files.map((url) => decodeURIComponent(url.pathname.split("/src/")[1]));
  for (const required of ["overview.stories.tsx", "mosaik.mdx"]) {
    assert.ok(relativePaths.includes(required), `locale audit is missing src/${required}`);
  }
  assert.ok(relativePaths.some((path) => path.includes("components/") && path.endsWith(".stories.tsx")), "locale audit found no component stories");

  const frenchTerms = [
    "Synchronise",
    "utilisateurs",
    "Alertes",
    "Nouvelle version disponible",
    "Hier",
    "Recherche",
    "Annuler",
    "Couche flottante",
    "ici",
    "encours",
    "en cours",
    "parcourez",
    "glissez",
    "ou",
    "valide",
    "presque",
    "atteint",
    "atteinte",
    "atteints",
    "disponible",
    "disponibles",
    "echoue",
    "echouee",
    "reussi",
    "reussie",
    "commence",
    "commencee",
    "cours",
    "utilise",
    "utilisee",
    "restant",
    "restante",
    "restants",
    "restantes",
    "avertissement",
    "fermer",
    "ouvrir",
    "choisir",
    "planifie",
    "planifiee",
    "maintenant",
    "publie",
    "publiee",
    "ajouter",
    "retirer",
    "supprimer",
    "tailles",
    "tons",
    "statut",
    "groupe",
    "actives",
    "nouveau",
    "rejouer",
    "Ko",
  ];
  const stopwords = ["le", "la", "les", "une", "des", "du", "dans", "pour", "avec", "sans", "toute", "toutes", "votre", "vos", "notre", "nos", "sera", "sont", "par", "pas", "ce", "cet", "cette", "ces", "au", "aux"];
  const termPattern = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${frenchTerms.map((term) => term.replace(/\s+/g, "\\s+")).join("|")})(?![\\p{L}\\p{N}_])`, "giu");
  const stopwordPattern = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${stopwords.join("|")})(?![\\p{L}\\p{N}_])`, "giu");
  const accentedWordPattern = /(?<!\p{L})\p{L}*[àâäçéèêëîïôöùûüÿœæ]\p{L}*(?!\p{L})/giu;
  const contractionPattern = /(?<!\p{L})(?:l|d|qu|n|s|j|c|m|t)[’'][\p{L}-]+/giu;
  const preserveLines = (text) => text.replace(/[^\r\n]/g, " ");
  const findings = [];
  for (const file of files) {
    const relative = `src/${decodeURIComponent(file.pathname.split("/src/")[1])}`;
    const source = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, preserveLines)
      .replace(/```[\s\S]*?```/g, preserveLines);
    for (const [index, line] of source.split(/\r?\n/).entries()) {
      if (/^\s*(?:import\b|\/\/)/.test(line)) continue;
      const auditLine = line.replace(/\bDM Sans\b/g, "       ");
      const matches = [...new Set([
        ...(auditLine.match(accentedWordPattern) ?? []),
        ...(auditLine.match(contractionPattern) ?? []),
        ...(auditLine.match(stopwordPattern) ?? []),
        ...(auditLine.match(termPattern) ?? []),
      ])];
      for (const match of matches) findings.push(`${relative}:${index + 1}: ${match}`);
    }
  }
  const codeStory = read("src/components/code-block/code-block.stories.tsx");
  const codeArgs = metaArgs(codeStory);
  for (const [prop, expected] of [["copyLabel", "Copy"], ["copiedLabel", "Copied!"]]) {
    if (!new RegExp(`\\b${prop}\\s*:\\s*["']${expected.replace("!", "\\!")}["']`).test(codeArgs)) {
      findings.push(`src/components/code-block/code-block.stories.tsx meta.args: ${prop} must be "${expected}"`);
    }
  }
  const overview = read("src/overview.stories.tsx");
  openingTags(overview, "CodeBlock").forEach((tag, index) => {
    for (const [prop, expected] of [["copyLabel", "Copy"], ["copiedLabel", "Copied!"]]) {
      if (literalProp(tag, prop) !== expected) findings.push(`src/overview.stories.tsx CodeBlock #${index + 1}: ${prop} must be "${expected}"`);
    }
  });

  const commandStory = read("src/components/command-palette/command-palette.stories.tsx");
  const commandProps = ["placeholder", "emptyMessage", "navigationLabel", "selectionLabel"];
  const isEnglishLiteral = (value) => typeof value === "string" && value.length > 0 && !/[àâäçéèêëîïôöùûüÿœæ]/iu.test(value) && !termPattern.test(value);
  const auditCommandProps = (source, location) => {
    for (const prop of commandProps) {
      const value = source.match(new RegExp(`\\b${prop}\\s*[:=]\\s*["']([^"']+)["']`))?.[1];
      termPattern.lastIndex = 0;
      if (!isEnglishLiteral(value)) findings.push(`${location}: ${prop} must provide an English string literal`);
    }
  };
  auditCommandProps(metaArgs(commandStory), "src/components/command-palette/command-palette.stories.tsx meta.args");
  openingTags(commandStory, "CommandPalette").forEach((tag, index) => auditCommandProps(tag, `src/components/command-palette/command-palette.stories.tsx CommandPalette #${index + 1}`));
  openingTags(overview, "CommandPalette").forEach((tag, index) => auditCommandProps(tag, `src/overview.stories.tsx CommandPalette #${index + 1}`));
  assert.deepEqual(findings, [], `French visible copy remains:\n${findings.join("\n")}`);
});
