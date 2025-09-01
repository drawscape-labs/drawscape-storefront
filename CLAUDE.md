# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify Hydrogen storefront built on the Skeleton template. Hydrogen is Shopify's React-based framework for building headless commerce storefronts. This project uses React Router v7 (not Remix) for routing.

## Development Commands

```bash
npm run dev        # Start development server with GraphQL codegen
npm run build      # Production build with GraphQL codegen
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
npm run codegen    # Generate GraphQL types only
```

## Architecture & Key Patterns

### File Structure
- `/app/routes/` - File-based routing (React Router v7)
- `/app/components/` - Reusable React components
- `/app/graphql/` - GraphQL queries/mutations with generated types
- `/app/lib/` - Core utilities (context, session, variants)
- Path alias: `~/` maps to `/app/` directory

### Import Rules (Critical)
This project uses React Router v7, NOT Remix. Always use:
```js
// CORRECT
import { useLoaderData, Link, Form } from 'react-router';

// INCORRECT - Never use these
import { ... } from '@remix-run/react';
import { ... } from 'react-router-dom';
```

### GraphQL & Data Fetching
- All Shopify data is fetched via GraphQL
- Types are auto-generated from queries
- Queries are co-located with routes
- Use fragments from `~/lib/fragments` for common data shapes

### Routing Patterns
Routes export standard React Router functions:
- `loader` - Fetch data server-side
- `action` - Handle form submissions
- `default` component - Render the page
- `meta` - Page metadata
- `handle` - Route-specific data

### Environment Requirements
- Node.js 18.0.0+
- Requires `SESSION_SECRET` environment variable
- Uses Shopify Oxygen for deployment

### Current Stack
- Hydrogen 2025.5.0
- React Router v7
- TypeScript
- Vite
- Tailwind CSS v4
- GraphQL with codegen