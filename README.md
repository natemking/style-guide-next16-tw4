# style-guide for Next v16 & TW v4

A Next/TS/TW style guide based on the retired Vercel Style Guide. **_This is for Next v16 and TW v4 as different setup is needed for other versions of Next and TW_**.

This is only a framework to bootstrap linting and code formatting. More-than-likely more work will need to be done to get this working in a codebase. This style guide was created because Vercel has retired their style guide and have not updated it to work with the new eslint flat config.

## Eslint

This is based off the new eslint flat config. Use the `eslint.config.mjs` file inside the root of your project. This file utilizes many of the below packages recommend settings as well as custom rules.

The following eslint packages & plugins need installed as dev dependencies:

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

> **Note:** Until `eslint-config-next` officially supports ESLint 10, you will see peer dependency warnings on install. These are harmless — everything works correctly. Track progress at [vercel/next.js#91702](https://github.com/vercel/next.js/issues/91702).

### ShadCN

The config applies relaxed rules to files under any `shadcn/` directory (`**/shadcn/**/*.{jsx,tsx}`). Place your shadcn components there (e.g. `src/components/shadcn/Button.tsx`) to have the overrides apply automatically.

## Prettier

Use the `prettier.config.mjs` & `.prettierignore` file in the root of your project.

The following Prettier packages & plugins need installed as dev dependencies:

-   prettier
-   prettier-plugin-packagejson
-   prettier-plugin-tailwindcss

Make sure your `tailwindStylesheet` path is correct in your `prettier.config.mjs`!

## Package.json
Make sure to add `"type": "module"` to your package.json. You may need to make sure all of your config & other files are in ESM syntax but since Next v14 this is now supported.

## Typescript config

Make sure TypeScript is installed (`typescript` dev dependency) and include your config files in `tsconfig.json`:

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

Run the setup script from your new project's root to copy all config files, patch `package.json` and `tsconfig.json`, and install dependencies in one step:

```
node ~/dev/style-guide-next16-tw4/setup.ts .
```

Or with an explicit path:

```
node ~/dev/style-guide-next16-tw4/setup.ts ~/dev/my-new-project
```

After running, update the two hardcoded paths:
- `eslint.config.mjs` → `better-tailwindcss` entryPoint (~line 58)
- `prettier.config.mjs` → `tailwindStylesheet` path

### Manual install

If you prefer to copy files yourself, install dependencies with:

```
pnpm add -D @eslint-community/eslint-plugin-eslint-comments @eslint/js eslint eslint-config-next eslint-config-prettier eslint-plugin-better-tailwindcss eslint-plugin-import-x eslint-plugin-unicorn typescript-eslint prettier prettier-plugin-packagejson prettier-plugin-tailwindcss
```

### Troubleshooting
If after applying to your project and linting is not happening, run `npx eslint .` from the root as there may be errors. The packages installed may be different from the time this was initially setup and breaking changes could have occurred.

## Future Additions

### eslint/css
Eslint now supports linting [CSS](https://eslint.org/blog/2025/02/eslint-css-support/) with the [@eslint/css](https://www.npmjs.com/package/@eslint/css) plugin but there are still bugs in installing it w/ pnpm and yarn as of the time of writing this. There are also a bunch of rules in the feature request pipeline. The plugin supports TW syntax as well but there is the following issue: 'The Tailwind syntax doesn't currently provide for the theme() function. This is a limitation of CSSTree that we hope will be resolved soon.'

Once these initial quirks are worked out, this plugin will be fully incorporated into this style guide.
