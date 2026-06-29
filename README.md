# Periodic Table of Algorithms & Data Structures

An interactive periodic-table-style reference for common algorithms and data
structures, built with Vite + TypeScript. Tiles are arranged left-to-right,
top-to-bottom in the classic periodic-table shape, ordered by ascending time
complexity starting from O(1).

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview   # optional: preview the production build locally
```

The build output goes to `dist/`.

## Project structure

```
index.html        entry HTML, mounts the table and modal
src/
  main.ts         renders the table + handles the detail modal
  data.ts         the algorithm/data-structure entries
  layout.ts        complexity ranking + periodic-table grid layout
  types.ts        shared TypeScript types
  style.css       all styling
```
