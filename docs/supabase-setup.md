# Supabase Setup

## 1. Create project

Create a project at [https://supabase.com](https://supabase.com).

## 2. Run migration

Apply [`supabase/migrations/001_foundation.sql`](../supabase/migrations/001_foundation.sql) via SQL Editor or Supabase CLI.

## 3. Auth providers

- **Google:** Authentication → Providers → Google → enable, add OAuth client credentials.
- **Anonymous:** Authentication → Providers → Anonymous → enable (guest mode).

## 4. Redirect URLs

Site URL: `http://localhost:3000`

Redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://<production-domain>/auth/callback`

## 5. Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
