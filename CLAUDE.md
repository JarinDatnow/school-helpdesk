# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # ESLint
```

## Architecture

Single-page React app (no router) with manual view state. `App.jsx` owns a `view` string and a `currentTeacher` string; all navigation is done by passing `setView`-style callbacks as props.

**View flow:**
```
home → parent          (ParentFlow: submit ticket to Supabase)
home → teacher-login   (TeacherLogin: select name + shared PIN "2024")
     → teacher-dashboard (TeacherDashboard: poll + manage all tickets)
          → admin       (AdminPage: stats, CSV export, purge resolved)
```

**Data layer** — `src/supabase.js` exports a single Supabase client built from `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY`. All DB calls hit a single `tickets` table with columns: `id`, `created_at`, `parent_name`, `teacher`, `message`, `status` (`open` | `attending` | `resolved`), `attended_by`.

**Teacher list** — `src/teachers.js` exports `TEACHERS`, a hardcoded array of ~52 staff names. This is the source of truth for both the parent's teacher picker and the teacher login dropdown. Update this array to add/remove staff.

**Polling** — `TeacherDashboard` refreshes every 3 seconds via `setInterval`. There is no Supabase Realtime subscription; the live indicator is cosmetic.

**Auth** — No real auth. Teachers pick their name from the dropdown and enter the shared PIN (`"2024"` hardcoded in `TeacherLogin.jsx:4`). The `currentTeacher` string is just used to stamp `attended_by` on ticket updates.

**Styling** — Tailwind CSS v4 via `@tailwindcss/vite` plugin. Amber colour palette throughout.

**Deployment** — `vercel.json` rewrites all routes to `/` (SPA fallback). Deployed to Vercel; env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` must be set in the Vercel project settings.
