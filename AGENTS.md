# Sip Happens — Agent Guide

## Project Overview

An espresso martini review blog built with Next.js 16 (App Router), TypeScript, React 19, and Tailwind CSS v4. Deployed on Vercel with a Neon Postgres database.

## Tech Stack

- **Framework**: Next.js 16 with App Router (`src/app/`)
- **Database**: Neon Postgres via `@neondatabase/serverless`
- **Auth**: Custom JWT auth using `jose` with httpOnly cookies (`src/lib/auth.ts`)
- **Styling**: Tailwind CSS v4 with custom espresso brown color palette defined in `src/app/globals.css`
- **Analytics**: `@vercel/analytics` in the root layout

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    api/auth/             # Login, logout, session check endpoints
    api/posts/            # CRUD API for blog posts
    admin/                # Admin dashboard, login, post editor (client components)
    reviews/              # Public review listing and detail pages
    about/                # About page
  components/             # Shared React components
  lib/
    db.ts                 # All database queries (async, uses neon() sql tagged templates)
    auth.ts               # JWT sign-in, sign-out, session verification
scripts/
  seed.ts                 # Database table creation and seed data (run via `npm run seed`)
```

## Key Conventions

- All database functions in `src/lib/db.ts` are **async** and return plain objects. Every call site must `await` them.
- Pages that read from the database export `dynamic = "force-dynamic"` to prevent Next.js from caching stale data.
- Admin pages (`src/app/admin/`) are `"use client"` components that check auth via `fetch("/api/auth/me")` on mount.
- The `published` field on posts is a Postgres `BOOLEAN`, not an integer.
- The color palette uses custom Tailwind theme tokens: `espresso-50` through `espresso-950`, plus `cream`, `foam`, `caramel`, and `crema`.

## Database

- Connection string is in `POSTGRES_URL` env var (`.env.local` locally, Vercel env vars in production).
- Schema has two tables: `users` and `posts`. See `scripts/seed.ts` for the full DDL.
- The `neon()` function from `@neondatabase/serverless` returns rows directly as an array (no `{ rows }` wrapper).

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `POSTGRES_URL` | Neon Postgres connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `ADMIN_EMAIL` | Default admin email (used by seed script) |
| `ADMIN_PASSWORD` | Default admin password (used by seed script) |

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run seed` | Create tables and insert seed data (requires `POSTGRES_URL` in `.env.local`) |
| `npm run lint` | Run ESLint |
