# Selling PDFs — Digital Product Delivery Plan

**Decision (2026-07-08):** Sell PDFs using Shopify's native **Digital Downloads** app for
storage + delivery. We build only the watermarked preview ourselves.

## Why this approach

- Checkout runs on Shopify even though the storefront is headless, so the Digital Downloads
  post-purchase delivery email works out of the box with **zero code**.
- No custom infrastructure to build or maintain.

## What lives where

| Asset                              | Where it lives                    | Public? |
| ---------------------------------- | --------------------------------- | ------- |
| Watermarked preview (1–2 pages)    | Shopify product media / metafield | Yes     |
| Full PDF                           | Shopify (via Digital Downloads)   | No      |
| Delivery email on payment          | Handled by Digital Downloads app  | —       |

## One-time setup

1. Install the free **Digital Downloads** app from the Shopify App Store.
2. For each PDF product in Shopify:
   - Create the product as usual.
   - Attach the **full PDF** via the Digital Downloads app (Shopify stores the file).
   - Upload the **watermarked preview** as product media / a metafield for the product page.

## Per-product checklist

- [ ] Generate watermarked preview (first 1–2 pages, stamped) with `pdf-lib`
- [ ] Create product in Shopify
- [ ] Attach full PDF via Digital Downloads app
- [ ] Upload preview as product media
- [ ] Test a real purchase → confirm the download-link email arrives

## What Shopify does automatically

- Stores the full PDF.
- On `orders/paid`, emails the buyer a download link — no code required.

## What we build (the only custom piece)

- A `pdf-lib` script that takes a source PDF and outputs a 1–2 page watermarked preview.
  Run it once per product.

## Explicitly out of scope (decided)

- ❌ Custom `/api/webhooks/shopify` route
- ❌ External object storage (R2 / S3 / Vercel Blob)
- ❌ Email-provider integration (Resend / Postmark / etc.)
- ❌ Per-buyer watermarking / download caps — not needed
