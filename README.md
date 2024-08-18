# SvelteKit Boilerplate

## Initial setup

- Need setup Supabase env variables in `.env` file (see `.env.example`).

## How to develop:

```bash
npm i
npm run dev -- --open
```

## How to build

```bash
npm i
npm run build
```

## To disable supabase
- delete `src/hooks.server.ts`. `src/+layout.server.ts`