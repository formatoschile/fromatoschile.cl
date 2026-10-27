#!/usr/bin/env bun

/**
 * Copies the pdf.js files the browser PDF viewer loads at runtime into
 * `public/pdfjs/`, so they're served same-origin and always match the
 * installed `pdfjs-dist` (see `usePdfViewer.ts`):
 *
 * - `pdf.worker.min.mjs`: the worker. Referencing it from node_modules with
 *   `new URL(…, import.meta.url)` instead clashes with `pdfjs-dist` being in
 *   `serverExternalPackages` when the viewer is server-rendered.
 * - `wasm/`: the WebAssembly image decoders (JBIG2/CCITTFax, JPEG 2000, ICC
 *   colour profiles). Without them, scanned PDFs render as blank pages.
 *
 * Runs before `dev` and `build`; the output is gitignored.
 */

import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PDFJS_DIR = join(ROOT, "node_modules/pdfjs-dist");
const TARGET_DIR = join(ROOT, "public/pdfjs");
const WORKER_FILE = "pdf.worker.min.mjs";
// The decoders and their pure-JS fallbacks; skips QuickJS (form scripting).
const WASM_FILE_PATTERN =
  /^(jbig2|openjpeg|qcms_bg)\.wasm$|_nowasm_fallback\.js$/;

rmSync(TARGET_DIR, { recursive: true, force: true });
mkdirSync(join(TARGET_DIR, "wasm"), { recursive: true });

copyFileSync(
  join(PDFJS_DIR, "build", WORKER_FILE),
  join(TARGET_DIR, WORKER_FILE)
);

const wasmFiles = readdirSync(join(PDFJS_DIR, "wasm")).filter((file) =>
  WASM_FILE_PATTERN.test(file)
);
for (const file of wasmFiles) {
  copyFileSync(join(PDFJS_DIR, "wasm", file), join(TARGET_DIR, "wasm", file));
}

console.log(
  `Copied the pdf.js worker and ${wasmFiles.length} wasm files to public/pdfjs`
);
