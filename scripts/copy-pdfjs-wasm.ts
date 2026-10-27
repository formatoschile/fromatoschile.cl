#!/usr/bin/env bun

/**
 * Copies pdf.js' WebAssembly image decoders (JBIG2/CCITTFax, JPEG 2000, ICC
 * colour profiles) into `public/` so the browser PDF viewer can load them
 * same-origin from `PDFJS_WASM_URL` (see `usePdfViewer.ts`). Without them,
 * scanned PDFs render as blank pages. Runs before `dev` and `build`, so the
 * copy always matches the installed `pdfjs-dist`; the output is gitignored.
 */

import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = join(ROOT, "node_modules/pdfjs-dist/wasm");
const TARGET_DIR = join(ROOT, "public/pdfjs/wasm");
// The decoders and their pure-JS fallbacks; skips QuickJS (form scripting).
const FILE_PATTERN = /^(jbig2|openjpeg|qcms_bg)\.wasm$|_nowasm_fallback\.js$/;

rmSync(TARGET_DIR, { recursive: true, force: true });
mkdirSync(TARGET_DIR, { recursive: true });

const files = readdirSync(SOURCE_DIR).filter((file) => FILE_PATTERN.test(file));
for (const file of files) {
  copyFileSync(join(SOURCE_DIR, file), join(TARGET_DIR, file));
}

console.log(`Copied ${files.length} pdf.js wasm files to public/pdfjs/wasm`);
