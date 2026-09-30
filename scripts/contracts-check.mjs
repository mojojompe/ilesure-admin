#!/usr/bin/env node
/**
 * Fails when src/contracts/generated.ts has drifted from the backend's contract.
 *
 * generated.ts is IleSure_Backend/src/contracts/apiContract.ts copied verbatim under a
 * "GENERATED" header (see the backend's scripts/sync-contracts.mjs). This compares the two
 * with the header removed and line endings normalised. When ../IleSure_Backend is not
 * checked out next to this repo (CI, Vercel) the check is skipped, not failed.
 *
 * Fix drift by running `npm run contracts:sync` in IleSure_Backend; never edit generated.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GENERATED = path.join(ROOT, 'src', 'contracts', 'generated.ts');
const SOURCE = path.resolve(ROOT, '..', 'IleSure_Backend', 'src', 'contracts', 'apiContract.ts');

const lf = (s) => s.replace(/\r\n/g, '\n');

const HEADER_LINE = /^(\/\/ GENERATED\b|\/\/ Source: |\/\* eslint-disable \*\/$)/;

/** Drop the generated header (its three known lines) and the blank lines after it. */
function stripGeneratedHeader(text) {
  const lines = lf(text).split('\n');
  let i = 0;
  while (i < lines.length && HEADER_LINE.test(lines[i])) i++;
  while (i < lines.length && lines[i].trim() === '') i++;
  return lines.slice(i).join('\n');
}

const stripLeadingBlank = (text) => lf(text).replace(/^\s*\n/, '');

if (!fs.existsSync(SOURCE)) {
  console.log(`contracts:check skipped: ${path.relative(ROOT, SOURCE)} not found (backend not checked out alongside).`);
  process.exit(0);
}
if (!fs.existsSync(GENERATED)) {
  console.error('contracts:check failed: src/contracts/generated.ts is missing. Run `npm run contracts:sync` in IleSure_Backend.');
  process.exit(1);
}

const generated = stripGeneratedHeader(fs.readFileSync(GENERATED, 'utf8'));
const source = stripLeadingBlank(fs.readFileSync(SOURCE, 'utf8'));

if (generated !== source) {
  const a = generated.split('\n');
  const b = source.split('\n');
  let line = 0;
  while (line < Math.max(a.length, b.length) && a[line] === b[line]) line++;
  console.error('contracts:check failed: src/contracts/generated.ts is stale.');
  console.error(`  first difference at contract line ${line + 1}:`);
  console.error(`    generated: ${a[line] ?? '<end of file>'}`);
  console.error(`    backend:   ${b[line] ?? '<end of file>'}`);
  console.error('  Run `npm run contracts:sync` in IleSure_Backend; never edit generated.ts by hand.');
  process.exit(1);
}

console.log('contracts:check ok: generated.ts matches IleSure_Backend/src/contracts/apiContract.ts');
