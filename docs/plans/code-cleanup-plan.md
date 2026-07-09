# Code Cleanup Plan

Full review of `src/` (2026-07-09) against the Vercel React best-practices and
composition-patterns guidelines, plus: Tailwind inefficiencies, code
organisation, bad practices, oversized components, and inefficient
queries/caching.

Each phase is independently shippable. Work top to bottom.

---

## Phase 1 — Delete dead code (no behavior change)

Confirmed unused via import search. Removing these first shrinks every later
diff (~1,500 lines).

### Dead component trees

- [x] `src/app/_components/PreferitiCarousel/` (both files — contains fabricated ratings/review counts/price variations; must never ship)
- [x] `src/app/_components/CollectionsRails/` (both files — also an N+1 query pattern)
- [x] `src/components/Grid/ThreeItems.tsx`
- [x] `src/components/layout/Search/` — entire tree (`Collections`, `FilterList`, `FilterItem`, `FilterItemDropdown`, `FilterList.types`)
- [x] `src/components/layout/Navbar/MobileMenu.tsx` + `NavbarSearch.tsx` (only reference each other)
- [x] `src/app/todos-los-documentos/children-wrapper.tsx`
- [x] `src/components/ui/Button/ButtonLink.tsx`
- [x] `src/hooks/useMediaQuery.ts`

### Dead functions / exports

- [x] `getYear()` in `src/lib/shopify/index.ts` (a cached wrapper around `new Date().getFullYear()`)
- [x] `containerVariants`, `smoothSpring` in `src/lib/animations.ts` (`itemVariants` stays — used by Accordion)

### Dead CSS & phantom utilities

- [x] `globals.css`: remove the "Model Editor Menu Range Input Styles" block (no range inputs exist in the codebase)
- [x] `globals.css`: remove `.gradient-border-animated` and `.animate-spin-slow` (unused)
- [x] Phantom classes used but defined nowhere (no `tailwind.config`, not in `@theme`): `animate-fadeIn` (ProductGridItems), `animate-blink` + `animation-delay-[…]` (LoadingDots — the spinner doesn't actually animate), `scrollbar-hide` (PreferitiCarousel, dies in Phase 1 anyway). Either define them in `@theme` or remove the class references.

### Dead dependencies / mounts

- [x] `<Toaster />` mounted in root layout but `toast()` never called — remove mount and `sonner` dep (or start using it)
- [x] Remove unused deps: `zustand`, `geist`, `dotenv`

---

## Phase 2 — Fix bugs & bad practices

- [x] **Double footer**: root layout renders `<Footer />` and `src/app/[page]/layout.tsx:9` renders it again → every `[page]` route shows two footers. Remove from `[page]/layout.tsx`.
- [x] **OG images crash**: `src/components/OpengraphImage.tsx:22` reads `src/fonts/Inter-Bold.ttf` which doesn't exist → all three `opengraph-image.tsx` routes throw. Add the font file or drop the custom font.
- [x] **Wrong language**: `lang="it"` in `src/app/layout.tsx:55` → `lang="es"`. Purge Italian strings: "Il tuo carrello" (CartModal), "Aggiungi al carrello" (AddToCart), "Calcolata al checkout" (CartModalContent), "Como funziona" (HowItWorks), "Gli altri di solito guardano anche questi" (product page), plus leftover English copy ("Out Of Stock", "Search for products...", error page).
- [x] **`Button` swallows props**: `ui/Button/Button.tsx` extends `ButtonHTMLAttributes` but never spreads rest → `type`, `onClick`, etc. silently dropped. Spread `...props`.
- [x] **`SITE_NAME` env bypass**: read via `process.env` + `!` assertion in `layout.tsx:31` and `OpengraphImage.tsx`, not declared in `src/env.ts`. Add to `env.ts` and import from there (project rule).
- [x] **Spurious cart creation**: `CartModal.tsx:25-29` runs `createCartAndSetCookie()` whenever `cart` is falsy — always true on first render (provider resolves the promise in an effect) → a cart-create mutation per visitor. Create the cart lazily on first add-to-cart instead.
- [x] **Prop mutation in render**: `CartModalContent.tsx:34` calls `cart.lines.sort(...)` → use `toSorted()` (js-tosorted-immutable).
- [x] **Dead UI**: search input + category filter buttons on `todos-los-documentos/page.tsx:26-52` render with no handlers/form wiring. Hide until Phase 5 implements them for real.
- [x] **Broken class**: `w-max-[550px]` in NavbarSearch (invalid; would be `max-w-[550px]`) — file dies in Phase 1, but don't reintroduce.
- [x] **`sitemap.ts:41`**: `throw JSON.stringify(error)` throws a string — throw the error itself.
- [x] **Typed escape hatches**: `optimisticUpdate: any` in `DeleteItemButton`/`EditItemQuantityButton` (type as `(merchandiseId: string, updateType: UpdateType) => void`), `checkoutUrl as any` in `cart/actions.ts`.

---

## Phase 3 — Data layer & caching

### Reorganise `src/lib/shopify/index.ts` (554 lines, four concerns)

- [x] Split into:
  - `client.ts` — `shopifyFetch`, endpoint/domain/key helpers
  - `reshape.ts` — `removeEdgesAndNodes`, `reshapeCart/Collection(s)/Product(s)/Images`
  - `cart.ts`, `products.ts`, `collections.ts`, `pages.ts`, `menu.ts` — domain query functions
- [x] Move `revalidate()` (webhook handler importing `NextRequest`/`NextResponse` into the data layer) into `src/app/api/revalidate/route.ts` where it belongs.

### Query efficiency

- [x] **Slim catalog fragment**: `getProducts` uses the full `product` fragment — 100 products × up to 250 variants × 20 images + `descriptionHtml` + SEO — for the catalog page (needs title/handle/first-variant-id/price/productType/tags/previewPdf) and the sitemap (needs handle/updatedAt). Add a `productCard` fragment; keep the full fragment for the product page only. Biggest payload win in the codebase.
- [x] **Bump API version**: `SHOPIFY_GRAPHQL_API_ENDPOINT = "/api/2023-01/graphql.json"` (`constants.ts:51`) is 3+ years old and will be removed by Shopify. Move to a current stable version.
- [x] **Cart mutations do double round-trips**: `removeItem`/`updateItemQuantity` re-fetch the whole cart to find a line ID the client already has. Pass the line ID from the client.

### Caching correctness

- [x] **`getCollection`**: has `"use cache"` but `cacheTag`/`cacheLife` are commented out → cached with no tag; the Shopify webhook can't purge it (stale collection SEO/metadata). Restore both lines.
- [x] **`getPage`/`getPages`**: no `"use cache"` at all, and `[page]/page.tsx` calls `getPage` in both `generateMetadata` and the page body → two Shopify round-trips per request, every request. Add `"use cache"` + a tag.
- [x] **`TAGS.cart` revalidation is a no-op**: kept deliberately with a comment — the call refreshes the client router cache after mutations, which re-runs the layout `getCart` and syncs the optimistic cart UI. `getCart` is per-user (cookie) so it cannot be `"use cache"`d.
- [x] **`RelatedProducts` blocks streaming**: async server component rendered without a Suspense boundary (`product/[handle]/page.tsx:111`) → the product page can't stream until recommendations resolve. Wrap in `<Suspense>` (async-suspense-boundaries).

---

## Phase 4 — Consolidation & theming

### One source of truth

- [x] **Money**: four price formatters exist — `lib/utils.formatPrice` (hardcoded **EUR** on a CLP store), `Price.tsx`'s private one, `toDocItem.ts`'s (es-CL), plus string math in `CartContext`. Create `lib/money.ts` (es-CL / CLP) and use it everywhere. Also fix `Price.tsx` rendering both the narrow symbol *and* the appended currency code ("$20.000 CLP").
- [x] **Category pills**: three drifting copies of the same pill-style map — `toDocItem.ts` `CATEGORY_STYLES`, `DocumentCategories.tsx` inline `tagClassName`s, `FeaturedTemplates.tsx` inline `categoryClassName`s (with key drift: "Commercial" vs "Comercial"). One `<CategoryPill category={...} />` + one style map.
- [x] **Remove styling from the data model**: `DocItem` carries `pillClassName`/`barClassName` (Tailwind strings in a domain type). Carry `category` only; map to styles at render.

### Tailwind

- [x] Extract repeated utility-string patterns into components: round icon button (`flex h-9 w-9 items-center justify-center rounded-full border …` — DocumentModal, FeaturedTemplates, documents page, CartModal), white card shell (`rounded-2xl bg-white p-6 shadow-sm ring-1 …`), category pill (above).
- [x] Replace arbitrary values that have token equivalents: `h-[24px] w-[24px]` → `h-6 w-6`, `min-w-[36px] max-w-[36px]` → `w-9`, `translate-x-[-100%]` → `-translate-x-full`; review `lg:px-[97.5px]`, `lg:pt-[80px]`, `max-w-[1666px]`.
- [x] Promote hardcoded colors to `@theme` tokens: `bg-[#323438]` (duplicated in Footer + SecuritySection), `text-[#363636]` (HomeHero).
- [x] Standardise v4 gradient syntax: `bg-gradient-to-t` (HomeHero) vs `bg-linear-to-t` (CollectionCard) → `bg-linear-*` everywhere.
- [x] Standardise on `classNames` from `@/lib/classNames` (clsx+twMerge) — half the components import raw `clsx`.

**Notes (2026-07-09):** `IconButton` and `CategoryPill` extracted. Card shells were deliberately NOT unified — they differ in radius/border/padding/hover per design, and forcing one `Card` would require boolean variant props (against the composition guidance). `lg:px-[97.5px]` / `max-w-[1666px]` kept as intentional design values. Price now formats once via `lib/money.ts` (no more duplicated "$20.000 CLP"). Category labels in `DocumentCategories`/`FeaturedTemplates` were normalized to the canonical set (Laboral, Inmobiliario, Sociedades, Comercial, Civil, Legal, Mercantil).

### Theme story (decide once)

- [x] Current state is contradictory: hardcoded `dark` class on `<html>` (does nothing in Tailwind v4 without `@custom-variant dark`), `color-scheme: dark` + `body bg-black text-white` in globals.css, while the design is light mint — and the vendored commerce components' `dark:` variants activate on **OS preference**, giving dark-OS users a broken mixed theme on product/cart pages.
- [x] Simplest correct fix: commit to light — strip the `dark` class, `color-scheme: dark`, the black body defaults, and all `dark:` variants from vendored components.

---

## Phase 5 — Structure & composition

### Split oversized single files

- [x] `DocumentsCatalog.tsx` (158) → `DocumentsCatalog` / `FeaturedCard` / `DocumentCard` / shared preview placeholder
- [x] `DocumentModal.tsx` (204) → modal + `PreviewPage`; `PreviewPage` and `PreviewThumbnail` duplicate the same faux-document placeholder — make one shared component
- [x] `CartContext.tsx` (282) → pure reducer + money helpers into `cartReducer.ts` (testable); provider stays
- [x] `FeaturedTemplates.tsx` (181) → data / carousel / card

### Move to the right home (project rules)

- [x] `Faq`, `LegalGuidance` are homepage-only → `src/app/_components/`
- [x] `RelatedProducts` (defined inside `product/[handle]/page.tsx`) → `product/[handle]/_components/`
- [x] `Price`, `Label`, `Prose` from `components/` root → `components/ui/`

### Composition (Vercel patterns)

- [x] `Accordion`: three boolean mode props (`fixedSize`, `showNumbers`, `fullSizeText`) driving conditional class soup — textbook `architecture-avoid-boolean-props`. Only one call site exists; simplify to what Faq needs or create explicit variants.
- [x] `Button`: take `children` instead of `label: string`.
- [x] `CartProvider`: replace `useEffect`+`setState` promise resolution with React 19 `use(cartPromise)` + Suspense — also removes the undefined-first-render behind the Phase 2 spurious-cart bug.
- [x] `FeaturedTemplates` is `"use client"` solely for two scroll buttons — isolate them into a small client component, keep the section on the server (bundle-size rules).

### Real data & features

- [x] Replace `FeaturedTemplates` hardcoded placeholder products (€-prices, identical feature lists) with Shopify data.
- [x] Replace `DocumentCategories` fake counts (15, 12, 18…) and duplicate "Civil" entry with real collection/product-type counts.
- [x] Implement the documents-page search + category filtering for real (client-side filtering over the already-fetched `DocItem[]` is sufficient at this catalog size).

---

## Phase 5 notes (2026-07-09)

- All phases complete. Additional move requested mid-phase: everything loose under `lib/` now lives in `lib/utils/` (`utils.ts` became `lib/utils/index.ts`, so `@/lib/utils` imports kept working).
- `BuyButton` moved from `todos-los-documentos/_components/` to `components/cart/` — the homepage `TemplateCard` needs it too.
- **Featured templates sourcing**: implemented as `getProducts({ sortKey: "BEST_SELLING" })`, top 6, with product tags as the feature bullets. Swap to a curated tag/collection later if desired.
- `DocumentCategories` counts now come from live product types; per-category marketing copy stays in a static map inside the component.
- Cart now uses the React 19 pattern (`use(cartPromise)` + `useOptimistic` in `useCart`, reducer in `cartReducer.ts`); optimistic updates run inside the same transition as their server action, and `CartModal` passes `updateCartItem` down so the rendered list is the copy that updates optimistically.
- Catalog search/filter is client-side over the fetched `DocItem[]` (accent-insensitive), with toggleable category chips showing real counts.
