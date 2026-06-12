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

test("preproduction data status is visible", () => {
  assert.match(html, /Preproducción/);
  assert.match(html, /Datos de referencia hasta homologación de fuentes/);
  assert.match(html, /Monitoreo Riesgo Persona/);
});

test("interactive controls have corresponding logic", () => {
  for (const handler of ["updateScenario", "updateStressTest", "exportMis", "renderLineChart"]) {
    assert.match(script, new RegExp(`function ${handler}`));
  }
});
