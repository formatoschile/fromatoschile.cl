# Code Style

## General Rules

- We use NextJs 16+
- We use the app router
- Page-specific/route-specific components live under `src/app/{route}/_components`
- Shared components live in `src/components/`
- All env variables should be defined through `src/env.ts`
- Code that interacts with external APIs/SDKs lives under `src/lib` (e.g. `src/lib/shopify/` for Storefront API)

## Early Return

Always prefer early return when possible

WRONG USAGE

```js
const x = false;
if (x) {
  console.log("true");
} else {
  console.log("false");
}
```

CORRECT USAGE

```js
const x = false;
if (x) {
  console.log("true");
  return;
}

console.log("false");
```

## React Components

### Function Definition

Avoid inline functions iin components when possible.

WRONG USAGE

```tsx
const MyComponent = () => {
  return (
    <span
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectWord(wordKey);
        }
      }}
    />
  );
};
```

CORRECT USAGE:

```tsx
const MyComponent = () => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectWord(wordKey);
    }
  };

  return <span onKeyDown={handleKeyDown} />;
};
```

### Components Definition

React components should use named exports, and follow this structure for typing props with Typescript

```tsx
interface MyComponentProps {
  name: string;
  count: number;
}

export const MyComponent: React.FC<MyComponentProps> = ({ name, count }) => {
  return (
    <div>
      <p>Name: {name}</p>
      <p>Count: {count}</p>
    </div>
  );
};
```

Logic can live inside the component directly ONLY WHEN IT IS SMALL. Otherwise, prefer splitting the logic into a separate hook. Hooks for a component can live in the same folder of the component. If there are more than 2 hooks, there should be a `hooks` folder within the component folder.

### Conditional Classes

When a className has conditional options, ALWAYS USE `classNames` from `@/lib/classNames`, rather than string condiitonals.
WRONG USAGE:

```jsx
export const MyComponent = () => {
  const [active, setActive] = useState(false);

  return (
    <div className={`flex flex-col ${active ? "bg-amber-50" : "bg-amber-800"}`}>
      ...
    </div>
  );
};
```

CORRECT USAGE:

```jsx
import { classNames } from "@/lib/classNames";

export const MyComponent = () => {
  const [active, setActive] = useState(false);

  return (
    <div className={classNames("flex flex-col", {
      'bg-amber-50': active,
      'bg-amber-800': !active,
    }>
       ...
    </div>
  )
}
```

## Styling

- Use tailwind for styling
- For colors, prefer defining variables in `src/app/globals.css` (e.g. in `@theme { ... }`)

## Shopify

- Shopify Storefront API client, queries, mutations, and types live under `src/lib/shopify/`
- Use cart actions from `src/components/cart/actions.ts` for add/update/remove; use cart context for UI state
- Product/collection data comes from `src/lib/shopify` queries; avoid ad-hoc Storefront API calls outside this layer

## Documentation & Onboarding

- Complicated components include a short comment on usage
- Document top-level files (like app/layout.tsx) and configs
- Keep README.md up to date with getting started, design tokens, and component usage notes
