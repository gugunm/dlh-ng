# Katalog Data Portal

Frontend prototype for the data catalog (Katalog Data), built with React, TypeScript, and Vite.

The app has no backend. It uses sample data, login is simulated, and changes are saved in your browser's `localStorage`.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- [pnpm](https://pnpm.io/installation) 9 or newer

## Getting started

Install the dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Then open <http://localhost:5173>. If you are signed out, enter any 18-digit NIP or valid email address and a password of at least 6 characters.

## Scripts

| Command        | Description                                       |
| -------------- | ------------------------------------------------- |
| `pnpm dev`     | Start the development server on port 5173         |
| `pnpm build`   | Type-check the code and build to `dist/`          |
| `pnpm preview` | Serve the production build locally (run `build` first) |
