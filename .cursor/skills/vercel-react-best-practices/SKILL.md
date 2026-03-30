---
name: vercel-react-best-practices
description: Apply Vercel-oriented React component and performance guidance for this repo. Use when creating or reviewing TSX components, extracting reusable UI, improving accessibility, or checking React code quality.
---

# Vercel React Best Practices

## Core Rules

- Keep components focused and composable.
- Prefer reusable components in `src/components`.
- Extract repeated logic into hooks only when it is genuinely reused.
- Avoid defining components inside other components unless there is a strong reason.
- Watch for waterfalls, unnecessary client code, and heavy imports in render paths.
- Prefer explicit props interfaces and stable component APIs.
