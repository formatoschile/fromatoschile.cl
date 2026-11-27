/// <reference types="bun" />

import { describe, expect, test } from "bun:test";

import { getPageType } from "./pageType";
import type { PageType } from "./pageType";

describe("getPageType", () => {
  test.each<[string, PageType]>([
    ["/", "home"],
    ["/todos-los-documentos", "catalog"],
    ["/todos-los-documentos/laboral", "category"],
    ["/product/contrato-de-trabajo", "product"],
    ["/preguntas-frecuentes", "faq"],
    ["/contacto", "contact"],
    ["/terminos-y-condiciones", "legal"],
    ["/api/something/else", "other"],
  ])("%s → %s", (pathname, expected) => {
    expect(getPageType(pathname)).toBe(expected);
  });
});
