# Security review — 2026-09-14

## Environment and Git

`.env` was tracked in Git because no ignore rule covered it. It has been removed
from the index while preserving the local file; `.env` variants are now ignored
and `.env.example` contains placeholders. Existing Git history still contains the
previous environment files. Configure deployment environment variables before
deploying a checkout that no longer includes `.env`.

The current Supabase key was decoded locally and has the `anon` role. It is a
public browser key, not a service-role secret. Never place privileged credentials
in `VITE_*`: these values are bundled into browser code. A pattern scan of current
tracked text files found no matching private keys or obvious privileged secrets;
this is not an exhaustive scan of Git history.

## Supabase — live verification pending

The environment project ID, URL and `supabase/config.toml` agree. Both public Auth
and REST endpoint checks failed with DNS `ENOTFOUND`, including outside the
sandbox. This does not establish whether the project is deleted, paused or simply
unresolvable from this environment. No live data was read or modified.

The initial migration grants public writes to products and blogs. The subsequent
20251209015900 migration removes those policies, enables role-based admin writes,
and limits public blog reads to published rows. All three tables have RLS enabled
in the migration chain. These files do not prove the migrations ran on the server.

`has_role` is a SECURITY DEFINER function with a fixed search path, but accepts an
arbitrary user ID and retains default function execution privileges. Once the
database is reachable, review RPC exposure: callers may be able to test another
known user's role. Prefer a current-user-only helper or restrict execution and
validate the caller, while preserving admin role management.

The generated TypeScript database schema is empty and AuthContext deliberately
sets `isAdmin` to false. This denies admin UI access; it does not grant unauthorized
access. Reconcile the actual database schema and regenerate types before enabling
admin features. Client route guards cannot replace database RLS.

Run the following read-only query in the intended project's SQL editor to verify
deployed RLS and policies. Confirm no public write policies remain, and test CRUD
as anonymous, ordinary authenticated, and admin users in an isolated database.

```sql
select c.relname, c.relrowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('products', 'blogs', 'user_roles');

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Also verify Auth email confirmation, signup requirements, redirect allowlist,
rate limits and admin MFA in the dashboard; they were not observable locally.

## Development server

Vite now binds to loopback by default instead of every network interface. Use an
explicit `--host` override only when LAN access is required.

## Dependency audit

Initial npm audit: 21 affected packages (16 high, 4 moderate, 1 low). Applied
`npm audit fix --ignore-scripts` within existing dependency ranges. The existing
uncommitted package-lock changes were retained as the starting point.

After remediation: 4 affected packages (1 high, 3 moderate), in the Vite/esbuild
and React Router chains. npm proposes major upgrades to Vite 6.4.3 and
react-router-dom 7.18.3; these upgrades have not been applied. Remaining advisories
include development-server exposure and Router redirect/SSR issues. This app uses
BrowserRouter and fixed local navigation targets in the reviewed code; no SSR
hydration path was found. That limits applicability but does not remove the
dependency advisories. Plan and validate those major upgrades before declaring
the dependency audit clean.

`bun.lockb` was not regenerated; the audit and fixes apply to package-lock.json.
Use npm for reproducible installs of these fixes.

Validation after changes: TypeScript (`tsc --noEmit -p tsconfig.app.json`) and
production build passed. ESLint reported 3 errors in unchanged files
(`ui/command.tsx`, `ui/textarea.tsx`, `tailwind.config.ts`) and 10 warnings.

## Reference

- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/database/postgres/row-level-security
