# @paylo/typescript-config

Shared TypeScript configurations for the Paylo monorepo.

## Configurations

- **`base.json`** - Base TypeScript config for all projects
- **`nextjs.json`** - Next.js specific settings
- **`react-library.json`** - React library configuration

## Usage

```json
// tsconfig.json
{
  "extends": "@paylo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

---

Part of the Paylo monorepo