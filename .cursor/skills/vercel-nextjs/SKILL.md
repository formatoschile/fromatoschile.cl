---
name: vercel-nextjs
description: Apply Vercel-aligned Next.js App Router patterns for this repo. Use when working on `src/app`, `next.config.ts`, routing, server and client component boundaries, metadata, images, fonts, or other Next.js implementation details.
---

# Vercel Next.js

## Core Rules

- Default to Server Components. Add `"use client"` only when browser APIs, state, or effects are required.
- Keep the client boundary as low as possible in the tree.
- Use App Router conventions and special files instead of Pages Router patterns.
- Use `next/navigation`, not `next/router`.
- Use the metadata API instead of `next/head`.
- Use `next/image` for images and `next/font` for fonts.
- In Next.js 16, treat `params`, `searchParams`, `cookies()`, and `headers()` as async.
- Prefer Node.js-compatible Next.js patterns over custom servers or framework workarounds.
