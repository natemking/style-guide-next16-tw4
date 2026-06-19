# style-guide for Next v16 & TW v4

A Next/TS/TW style guide based on the retired Vercel Style Guide. **_This is for Next v16 and TW v4 as different setup is needed for other versions of Next and TW_**.

A complete linting and formatting setup for new Next.js projects. Run the setup script, update two paths, and you're done. Built because Vercel retired their style guide without updating it for ESLint flat config.

## Eslint

Based on the new ESLint flat config. The `eslint.config.mjs` file is copied into your project root by the setup script and utilizes the packages below with recommended settings and custom rules.

The following ESLint packages & plugins are installed as dev dependencies:

-   @eslint-community/eslint-plugin-eslint-comments
-   @eslint/js
-   eslint
-   eslint-config-next
-   eslint-config-prettier
-   eslint-plugin-better-tailwindcss
-   eslint-plugin-import-x
-   eslint-plugin-unicorn
-   typescript-eslint

Make sure your better-tailwindcss `entryPoint` path is correct in your `eslint.config.mjs`!

### Import plugin

`eslint-config-next` bundles `eslint-plugin-import` which does not support ESLint 10. This config patches it out at runtime in favor of `eslint-plugin-import-x`, a drop-in replacement that supports ESLint 10. No rule changes are needed — all `import/*` rules work identically.

> **Note:** Until `eslint-config-next` officially supports ESLint 10, you will see peer dependency warnings on install. These are harmless — everything works correctly.

### ShadCN

The config applies relaxed rules to files under any `shadcn/` directory (`**/shadcn/**/*.{jsx,tsx}`). Place your shadcn components there (e.g. `src/components/shadcn/Button.tsx`) to have the overrides apply automatically.

## Prettier

The `prettier.config.mjs` & `.prettierignore` files are copied into your project root by the setup script.

The following Prettier packages & plugins are installed as dev dependencies:

-   prettier
-   prettier-plugin-packagejson
-   prettier-plugin-tailwindcss

Make sure your `tailwindStylesheet` path is correct in your `prettier.config.mjs`!

## Package.json

The setup script automatically adds `"type": "module"` to your `package.json`. All config files use ESM syntax, which has been supported since Next v14. If setting up manually, add this yourself.

## Typescript config

The setup script automatically patches `tsconfig.json` with the required include entries. If setting up manually, make sure these are present:

```
"include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "**/*.config.js",
    "**/*.config.mjs",
    "**/*.config.cjs"
]
```

<hr />

## Setup

Run the setup script from your new project's root, pointing to wherever you cloned this repo:

```
node /path/to/style-guide-next16-tw4/setup.ts .
```

Or pass the target directory explicitly:

```
node /path/to/style-guide-next16-tw4/setup.ts /path/to/my-new-project
```

The script will:
- Copy `eslint.config.mjs`, `prettier.config.mjs`, and `.prettierignore`
- Patch `package.json` with `"type": "module"`
- Patch `tsconfig.json` with the required include entries
- Install all dependencies
- Optionally install pre-commit hooks (Husky + lint-staged) — defaults to yes

After running, update the two hardcoded paths:
- `eslint.config.mjs` → `better-tailwindcss` entryPoint (~line 67)
- `prettier.config.mjs` → `tailwindStylesheet` path

### Pre-commit hooks

If you opted in, the setup installs Husky with a pre-commit hook that:
- Runs `tsc --noEmit` to catch type errors
- On your first commit after setup, runs Prettier and ESLint across the entire project
- On all subsequent commits, runs lint-staged (staged files only)

### Manual install

If you prefer to copy files yourself, install dependencies with:

```
pnpm add -D @eslint-community/eslint-plugin-eslint-comments @eslint/js eslint eslint-config-next eslint-config-prettier eslint-plugin-better-tailwindcss eslint-plugin-import-x eslint-plugin-unicorn typescript-eslint prettier prettier-plugin-packagejson prettier-plugin-tailwindcss
```

You will also need to manually apply the Package.json and TypeScript config changes described above.

### Troubleshooting

If linting is not working after setup, run `npx eslint .` from the project root — there may be config errors in the output. Package versions may have changed since this was last tested and breaking changes could have occurred.

## Future Additions

### eslint/css
Eslint now supports linting [CSS](https://eslint.org/blog/2025/02/eslint-css-support/) with the [@eslint/css](https://www.npmjs.com/package/@eslint/css) plugin but there are still bugs in installing it w/ pnpm and yarn as of the time of writing this. There are also a bunch of rules in the feature request pipeline. The plugin supports TW syntax as well but there is the following issue: 'The Tailwind syntax doesn't currently provide for the theme() function. This is a limitation of CSSTree that we hope will be resolved soon.'

Once these initial quirks are worked out, this plugin will be fully incorporated into this style guide.
