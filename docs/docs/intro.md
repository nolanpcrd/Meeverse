---
sidebar_position: 1
---

# Meeverse Documentation

This is the minimal technical documentation for the current Meeverse project.

## Project Scope

- `apps/API`: Fastify TypeScript backend
- `apps/Meeverse`: Expo React Native frontend
- `packages/shared`: shared contracts (DTOs/types) between backend and frontend

## Backend Conventions

The API uses a simple layered structure:

- `routes`: HTTP endpoint registration
- `controllers`: request/response orchestration
- `services`: business logic

## Shared Objects

Use shared contracts from `packages/shared` to keep frontend and backend aligned.

## Run Docs Locally

```bash
npm install
npm run start
```

The docs site is served locally and reloads automatically on file changes.
