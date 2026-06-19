#!/usr/bin/env node
// @ts-nocheck
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = resolve(process.argv[2] ?? '.');

if (!existsSync(target)) {
    console.error(`Target directory does not exist: ${target}`);
    process.exit(1);
}

// Copy config files
const files = ['eslint.config.mjs', 'prettier.config.mjs', '.prettierignore'] as const;

for (const file of files) {
    copyFileSync(resolve(__dirname, file), resolve(target, file));
    console.log(`Copied ${file}`);
}

// Patch package.json — add "type": "module"
const pkgPath = resolve(target, 'package.json');
if (existsSync(pkgPath)) {
    const pkg: Record<string, unknown> = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (pkg['type'] !== 'module') {
        pkg['type'] = 'module';
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        console.log('patched package.json: added "type": "module"');
    }
} else {
    console.warn('No package.json found in target — skipping');
}

// Patch tsconfig.json — merge required include entries
const tsconfigPath = resolve(target, 'tsconfig.json');
if (existsSync(tsconfigPath)) {
    try {
        const tsconfig: { include?: string[] } = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
        const required = ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts', '**/*.config.js', '**/*.config.mjs', '**/*.config.cjs'];
        const existing = tsconfig.include ?? [];
        const missing = required.filter(e => !existing.includes(e));
        if (missing.length > 0) {
            tsconfig.include = [...existing, ...missing];
            writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 4) + '\n');
            console.log(`patched tsconfig.json: added ${missing.join(', ')}`);
        }
    } catch {
        console.warn('Could not parse tsconfig.json — update the include array manually');
    }
} else {
    console.warn('No tsconfig.json found in target — update the include array manually');
}

// Install dependencies
console.log('\nInstalling style guide dependencies...');
execSync(
    'pnpm add -D @eslint-community/eslint-plugin-eslint-comments @eslint/js eslint eslint-config-next eslint-config-prettier eslint-plugin-better-tailwindcss eslint-plugin-import-x eslint-plugin-unicorn typescript-eslint prettier prettier-plugin-packagejson prettier-plugin-tailwindcss',
    { cwd: target, stdio: 'inherit' }
);

// Optionally install pre-commit hooks
const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = await rl.question('\nInstall pre-commit hooks (Husky + lint-staged)? [Y/n] ');
rl.close();

const normalized = answer.trim().toLowerCase();
if (normalized === '' || normalized === 'y') {
    console.log('\nInstalling pre-commit hooks...');
    execSync('pnpm add -D husky lint-staged', { cwd: target, stdio: 'inherit' });
    execSync('pnpm exec husky init', { cwd: target, stdio: 'inherit' });

    // husky init writes "npm test" — overwrite with our hooks
    const preCommit = [
        '#!/usr/bin/env sh',
        'set -e',
        'npx tsc --noEmit',
        'FIRST_RUN_FLAG="$(git rev-parse --git-dir)/.first-run"',
        'if [ -f "$FIRST_RUN_FLAG" ]; then',
        '    rm "$FIRST_RUN_FLAG"',
        '    npx prettier --write .',
        '    npx eslint --fix .',
        'else',
        '    npx lint-staged',
        'fi',
    ].join('\n') + '\n';
    writeFileSync(resolve(target, '.husky/pre-commit'), preCommit);

    // create flag so the first user commit runs full lint instead of lint-staged
    writeFileSync(resolve(target, '.git/.first-run'), '');

    // Merge lint-staged config into package.json (re-read since husky init may have modified it)
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (!pkg['lint-staged']) {
        pkg['lint-staged'] = {
            '**/*.{ts,tsx,js,jsx,mjs,cjs}': ['prettier --write', 'eslint --fix'],
        };
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    }

    console.log('Pre-commit hooks installed successfully');
}

console.log(`
Done! If your Tailwind CSS entry is not './src/app/globals.css', update these before linting:

  eslint.config.mjs   line 67  entryPoint
  prettier.config.mjs line 15  tailwindStylesheet
`);
