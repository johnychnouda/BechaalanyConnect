#!/usr/bin/env node
/**
 * Fails when the locale files drift apart.
 *
 * ar.json was missing the whole `products` namespace plus three `common.*` keys, and
 * nothing caught it — because next-intl was never actually wired up, so a missing key
 * produced no visible error and no build failure. Now that the message files matter,
 * this makes divergence a CI failure rather than something a user discovers.
 *
 *   node scripts/i18n-check.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'translations');

const flatten = (obj, prefix = '') =>
    Object.entries(obj).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        return value && typeof value === 'object' && !Array.isArray(value)
            ? flatten(value, path)
            : [path];
    });

const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

if (files.length < 2) {
    console.error(`i18n-check: expected at least two locale files in ${dir}`);
    process.exit(1);
}

const locales = Object.fromEntries(
    files.map((file) => [
        file.replace(/\.json$/, ''),
        new Set(flatten(JSON.parse(readFileSync(join(dir, file), 'utf8')))),
    ])
);

// Every key present in any locale must be present in all of them.
const union = new Set(Object.values(locales).flatMap((keys) => [...keys]));
let failed = false;

for (const [locale, keys] of Object.entries(locales)) {
    const missing = [...union].filter((key) => !keys.has(key)).sort();

    if (missing.length) {
        failed = true;
        console.error(`\n${locale}.json is missing ${missing.length} key(s):`);
        missing.forEach((key) => console.error(`  - ${key}`));
    }
}

if (failed) {
    console.error('\ni18n-check failed: locale files are out of sync.\n');
    process.exit(1);
}

console.log(`i18n-check: ${Object.keys(locales).length} locales in sync (${union.size} keys).`);
