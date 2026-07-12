# Environment Setup

## Environment Files

Two environment files live in `src/environments/`:

| File | Configuration | Used when |
|------|---------------|-----------|
| `environment.ts` | `production: true` | Production build |
| `environment.development.ts` | `production: false` | `ng serve` / dev build |

Angular swaps these via `fileReplacements` in `angular.json`:

```json
"fileReplacements": [{
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.development.ts"
}]
```

## Current Environment Shape

```typescript
// environment.ts
export const environment = {
    production: true,
    apiUrl: 'http://localhost:3000/api/v1',
};

// environment.development.ts
export const environment = {
    production: false,
    apiUrl: 'http://' + window.location.hostname + ':3000/api/v1',
};
```

## Injection Token Pattern

Components and services must **never** import environment files directly. Use the `APP_ENVIRONMENT` injection token instead:

```typescript
import { inject } from '@angular/core';
import { APP_ENVIRONMENT, AppEnvironment } from 'app/core/config/app-config.types';

const env = inject<AppEnvironment>(APP_ENVIRONMENT);
// env.apiUrl, env.production
```

The provider in `app.config.ts` wraps the environment object:

```typescript
provideAppEnvironment()
```

This reads from `environment.ts` and provides it via the `APP_ENVIRONMENT` token, defined in `core/config/app-config.token.ts`:

```typescript
export function provideAppEnvironment(config?: Partial<AppEnvironment>): Provider {
    return {
        provide: APP_ENVIRONMENT,
        useValue: { ...environment, ...config } as AppEnvironment,
    };
}
```

The `AppEnvironment` interface is defined in `core/config/app-config.types.ts`:

```typescript
export interface AppEnvironment {
    production: boolean;
    apiUrl: string;
}
```

## .env.example Usage

A `.env.example` file documents available environment variables for reference:

```
API_URL=http://localhost:3000/api/v1
APP_NAME=Enterprise Starter
DEFAULT_LAYOUT=classy
```

This file is informational — the Angular app does not read `.env` files at runtime. Environment values must be updated directly in `src/environments/environment.ts` (and `environment.development.ts` for local dev).

## Adding a New Environment Variable

1. Add the property to both `environment.ts` and `environment.development.ts`
2. Extend the `AppEnvironment` interface in `core/config/app-config.types.ts`
3. Update `.env.example` for documentation
4. Inject via `@Inject(APP_ENVIRONMENT)` or `inject(APP_ENVIRONMENT)` wherever needed

## Multi-Environment Setup

To add a new environment (e.g. `staging`):

1. Create `src/environments/environment.staging.ts`
2. Add a build configuration in `angular.json` under `projects.fuse.architect.build.configurations`
3. Add the `fileReplacements` entry pointing to the new staging file
4. Build with `ng build --configuration staging`
