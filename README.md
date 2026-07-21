# dos — AI day planner

A mobile-first family to-do app. You dump everything on your mind; an AI layer
(coming later) turns it into structured tasks. Interface is in English.

## Screens

- **Capture** — full-screen "What's on your mind?" field + big mic button
- **Inbox** — list of parsed tasks (empty-state for now)
- **Today** — checklist of today's tasks (empty-state for now)

Big touch targets, dark theme, green accent, bottom tab navigation.

## Task model

`id, title, priority (high/medium/low), estimate (minutes, optional),
due (date, optional), assignee (Mom/Dad/Kid or empty), status (todo/done),
createdAt`.

State lives on the client (React state + `localStorage`) — no backend yet,
no AI yet. This is the scaffold.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Tech

Next.js (App Router) + React + TypeScript. No UI dependencies — plain CSS.
