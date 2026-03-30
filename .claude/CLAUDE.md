# Project: Insulti Luminosi e-commerce

This is a Next.js 16 e-commerce application with App Router, Shopify Headless, Taiwlwind.

## Commands

See @package.json for available npm scripts

## Architecture

- `/app`: Next.js App Router pages and layouts
- `/app`
- `/components/ui`: Reusable UI components
- `/lib`: Utilities and shared logic
- `/app/api`: API routes

## Important Notes

- NEVER commit .env files
- This e-commerce relies on Shopify Headless CMS for all the e-commerce related feature

## Coding Patterns and Best Practices

- Prefer single object parameters (improves backwards-compatibility)
- Prefer interface over types
- Prefer functions over classes (classes only for errors/adapters)
- Prefer pure functions; when mutation is unavoidable, return the mutated object instead of void.
- Organize functions top-down: exports before helpers
- Use `import type` for types, regular `import` for values, separate statements even from same module
- Prefix booleans with `is`/`has`/`can`/`should` (e.g., `isValid`, `hasData`) for clarity
