import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const script = await readFile(new URL("../app.js", import.meta.url), "utf8");

test("dashboard contains the core executive sections", () => {
  for (const section of ["resumen", "alertas", "segmentos", "estres", "estrategia"]) {
    assert.match(html, new RegExp(`id="${section}"`));
  }
});

test("synthetic-data disclaimer is visible", () => {
  assert.match(html, /Datos 100% sintéticos/);
  assert.match(html, /No representa información real/);
});

test("interactive controls have corresponding logic", () => {
  for (const handler of ["updateScenario", "updateStressTest", "exportMis", "renderLineChart"]) {
    assert.match(script, new RegExp(`function ${handler}`));
  }
});
