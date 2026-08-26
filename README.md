# Formatos Chile

A high-performance, server-rendered Next.js App Router ecommerce application.

This template uses React Server Components, Server Actions, `Suspense`, `useOptimistic`, and more.

## Running locally

You will need the environment variables [defined in `.env.example`](.env.example) to run the app. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control your Shopify store.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
bun install
bun run dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

## Vercel, Next.js Commerce, and Shopify Integration Guide

You can use this comprehensive [integration guide](https://vercel.com/docs/integrations/ecommerce/shopify) with step-by-step instructions on how to configure Shopify as a headless CMS using Next.js Commerce as your headless Shopify storefront on Vercel.
