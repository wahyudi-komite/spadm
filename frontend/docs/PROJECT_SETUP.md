# Project Setup

## Prerequisites

- Node.js 18+ (LTS recommended)
- Angular CLI 19.x: `npm install -g @angular/cli`

## Install

```bash
cd fuse
npm install
```

## Development Server

```bash
npm start
# or: ng serve
```

Starts at `http://localhost:4200` with the `development` configuration. The dev server uses `proxy.conf.json` to forward `/api/*` requests to `http://localhost:3010`.

### Proxy Configuration

`proxy.conf.json` rewrites `/api` prefix when proxying to the backend:

```json
{
    "/api/**": {
        "target": "http://localhost:3010",
        "secure": false,
        "changeOrigin": true,
        "pathRewrite": { "^/api": "" }
    }
}
```

## Production Build

```bash
npm run build
# or: ng build
```

Outputs to `dist/flatag/` with production configuration. Environments use `fileReplacements` in `angular.json`: `environment.ts` is the production file, `environment.development.ts` is swapped in during development.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `ng serve` | Development server with hot reload |
| `npm run build` | `ng build` | Production build to `dist/flatag/` |
| `npm run watch` | `ng build --watch --configuration development` | Dev build with watch mode |
| `npm test` | `ng test` | Run unit tests (Karma) |
| `npm run ng` | `ng` | Pass-through to Angular CLI |

## Base Href

The app is configured with `"baseHref": "/flatag/"` in `angular.json`. Change this to match your deployment path, or set to `/` for root deployment.
