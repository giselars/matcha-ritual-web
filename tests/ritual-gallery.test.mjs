import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const source = readFileSync(
  new URL("../src/scripts/ritual-gallery.js", import.meta.url),
  "utf8",
).replace("export const", "const");
function setup() {
  const timers = new Map(),
    observers = [],
    images = [];
  let id = 0;
  class Element {
    listeners = {};
    attrs = {};
    textContent = "";
    hidden = false;
    addEventListener(name, fn) {
      (this.listeners[name] ??= []).push(fn);
    }
    emit(name, event = {}) {
      for (const fn of this.listeners[name] ?? []) fn(event);
    }
    setAttribute(name, value) {
      this.attrs[name] = value;
    }
    animate() {
      return { finished: Promise.resolve(), cancel() {} };
    }
    focus() {
      content.emit("focusin", { target: this });
    }
  }
  const content = new Element(),
    image = new Element(),
    panel = new Element(),
    playback = new Element();
  const heading = new Element(),
    copy = new Element(),
    tabs = Array.from({ length: 3 }, (_, i) =>
      Object.assign(new Element(), { id: `tab-${i + 1}` }),
    );
  tabs[0].attrs["aria-selected"] = "true";
  content.querySelector = (s) => (s === "#step-panel" ? panel : playback);
  content.querySelectorAll = () => tabs;
  panel.querySelector = (s) => (s === "h3" ? heading : copy);
  const document = new Element();
  document.hidden = false;
  document.querySelector = (s) => (s === ".ritual-content" ? content : image);
  const reduced = new Element();
  reduced.matches = false;
  const context = vm.createContext({
    document,
    window: { matchMedia: () => reduced },
    Image: class {
      constructor() {
        images.push(this);
      }
      decode() {
        return Promise.resolve();
      }
    },
    IntersectionObserver: class {
      constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        observers.push(this);
      }
      observe() {}
      disconnect() {}
    },
    setTimeout: (fn, ms) => {
      timers.set(++id, { fn, ms });
      return id;
    },
    clearTimeout: (key) => timers.delete(key),
  });
  vm.runInContext(source, context);
  const flush = async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  };
  const visible = (value) =>
    observers[0].callback([
      { isIntersecting: value, intersectionRatio: value ? 1 : 0 },
    ]);
  const tick = async () => {
    const entry = [...timers].find(([, v]) => v.ms === 7000);
    assert.ok(entry, "reading timer exists");
    timers.delete(entry[0]);
    entry[1].fn();
    await flush();
  };
  const resolve = async () => {
    for (const img of images.splice(0)) img.onload();
    await flush();
  };
  const selected = () =>
    tabs.findIndex((tab) => tab.attrs["aria-selected"] === "true");
  const scheduled = () => [...timers.values()].some((v) => v.ms === 7000);
  return {
    content,
    document,
    reduced,
    playback,
    tabs,
    images,
    image,
    heading,
    visible,
    tick,
    resolve,
    flush,
    selected,
    scheduled,
  };
}
test("complete cycle; manual selection pauses; resume, hover, visibility and reduced motion gate timing", async () => {
  const s = setup();
  assert.equal(s.scheduled(), false);
  s.visible(true);
  for (const index of [1, 2, 0]) {
    await s.tick();
    await s.resolve();
    assert.equal(s.selected(), index);
  }
  s.tabs[2].emit("click");
  await s.resolve();
  assert.equal(s.selected(), 2);
  assert.equal(s.scheduled(), false);
  s.playback.emit("click");
  assert.ok(s.scheduled());
  s.content.emit("pointerenter", { pointerType: "mouse" });
  assert.equal(s.scheduled(), false);
  s.content.emit("pointerleave");
  assert.ok(s.scheduled());
  s.visible(false);
  assert.equal(s.scheduled(), false);
  s.visible(true);
  assert.ok(s.scheduled());
  s.document.hidden = true;
  s.document.emit("visibilitychange");
  assert.equal(s.scheduled(), false);
  s.document.hidden = false;
  s.document.emit("visibilitychange");
  assert.ok(s.scheduled());
  s.reduced.matches = true;
  s.reduced.emit("change");
  assert.equal(s.scheduled(), false);
  assert.ok(s.playback.hidden);
  s.tabs[1].emit("click");
  await s.resolve();
  assert.equal(s.selected(), 1);
});
test("failed image preserves full scene and retries; latest rapid selection wins", async () => {
  const s = setup();
  s.visible(true);
  await s.tick();
  s.images.shift().onerror();
  await s.flush();
  assert.equal(s.selected(), 0);
  assert.equal(s.heading.textContent, "");
  await s.tick();
  await s.resolve();
  assert.equal(s.selected(), 1);
  assert.match(s.image.src, /batir/);
  s.tabs[0].emit("click");
  s.tabs[2].emit("click");
  await s.resolve();
  assert.equal(s.selected(), 2);
  assert.match(s.image.src, /disfrutar/);
  assert.equal(s.heading.textContent, "Este momento es tuyo.");
});
test("keyboard pauses permanently and preserves target selection", async () => {
  const s = setup();
  s.visible(true);
  s.tabs[0].emit("keydown", { key: "End", preventDefault() {} });
  await s.resolve();
  assert.equal(s.selected(), 2);
  assert.equal(s.scheduled(), false);
  s.visible(false);
  s.visible(true);
  assert.equal(s.scheduled(), false);
  s.tabs[2].emit("keydown", { key: "Home", preventDefault() {} });
  await s.resolve();
  assert.equal(s.selected(), 0);
});
