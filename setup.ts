#!/usr/bin/env node
// @ts-nocheck
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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
    console.log(`copied ${file}`);
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
    console.warn('no package.json found in target — skipping');
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
        console.warn('could not parse tsconfig.json — update the include array manually');
    }
} else {
    console.warn('no tsconfig.json found in target — update the include array manually');
}

// Install dependencies
console.log('\ninstalling dependencies...');
execSync(
    'pnpm add -D @eslint-community/eslint-plugin-eslint-comments @eslint/js eslint eslint-config-next eslint-config-prettier eslint-plugin-better-tailwindcss eslint-plugin-import-x eslint-plugin-unicorn typescript-eslint prettier prettier-plugin-packagejson prettier-plugin-tailwindcss',
    { cwd: target, stdio: 'inherit' }
);

console.log(`
done! update these paths before linting:
  eslint.config.mjs   → better-tailwindcss entryPoint (~line 67)
  prettier.config.mjs → tailwindStylesheet path
`);
