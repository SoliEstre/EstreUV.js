#!/usr/bin/env node
/**
 * PM 007 I1 + I3 측정 — EstreUV 본체 코드 규모.
 *
 *  I1: EstreUV 본체 코드 < 2,000 LoC      (컨벤션 레이어가 얇아야 운영 가능)
 *  I3: 번들 사이즈 (minified+gzip) < 15KB  (lit core 는 external — EstreUV 레이어만)
 *
 * 사용: node scripts/measure-bundle.mjs
 */

import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { gzipSync } from 'node:zlib';
import * as esbuild from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, '..', 'src');

// EstreUV 본체 = src/ 의 라이브러리 코드. 검증용 main.js (spike repo 자체 부트) 는 라이브러리 본체 아님 → 제외.
const SRC_FILES = readdirSync(SRC_DIR)
    .filter(f => f.endsWith('.js') && f !== 'main.js')
    .sort();

// ─── I1: LoC ────────────────────────────────────────────────────────────
function stripComments(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '')   // block comments
        .replace(/^\s*\/\/.*$/gm, '');       // line comments
}
let totalLines = 0, totalNonEmpty = 0, totalCode = 0;
const perFile = [];
for (const f of SRC_FILES) {
    const code = readFileSync(join(SRC_DIR, f), 'utf8');
    const lines = code.split('\n');
    const nonEmpty = lines.filter(l => l.trim() !== '').length;
    const codeOnly = stripComments(code).split('\n').filter(l => l.trim() !== '').length;
    totalLines += lines.length;
    totalNonEmpty += nonEmpty;
    totalCode += codeOnly;
    perFile.push({ f, lines: lines.length, nonEmpty, codeOnly });
}

// ─── I3: minified + gzip (lit core external) ────────────────────────────
const tmp = mkdtempSync(join(tmpdir(), 'estreuv-bundle-'));
const entryPath = join(tmp, 'entry.js');
// 배럴 (index.js) + 모든 component 파일 (tile · sidebar 등) 을 하나의 entry 로 — 소비자가 실제로 끌어다 쓰는 전부.
// (index.js 의 deps 와 중복되는 모듈은 esbuild 가 dedupe)
const componentFiles = SRC_FILES.filter(f => f !== 'index.js'
    && (f.endsWith('-tile.js') || f.endsWith('sidebar.js') || f.endsWith('-item.js')));
const entry = [
    `export * from ${JSON.stringify(join(SRC_DIR, 'index.js'))};`,
    ...componentFiles.map(f => `import ${JSON.stringify(join(SRC_DIR, f))};`),
].join('\n');
writeFileSync(entryPath, entry, 'utf8');

const result = await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    minify: true,
    format: 'esm',
    target: 'es2022',
    external: ['lit', 'lit/*', '@lit/context', '@lit/reactive-element', 'lit-html', 'lit-element', 'lit-html/*'],
    write: false,
    legalComments: 'none',
});
const minified = result.outputFiles[0].contents;
const gzipped = gzipSync(Buffer.from(minified));
rmSync(tmp, { recursive: true, force: true });

// ─── report ─────────────────────────────────────────────────────────────
const kb = (n) => (n / 1024).toFixed(2) + ' KB';
const I1_LIMIT = 2000, I3_LIMIT_KB = 15;
const i1Pass = totalCode < I1_LIMIT;
const i3Pass = gzipped.length / 1024 < I3_LIMIT_KB;

console.log('─── EstreUV bundle measurement (PM 007 I1 · I3) ───\n');
console.log('src/ files (라이브러리 본체, main.js 제외):');
for (const r of perFile) console.log(`  ${r.f.padEnd(24)} ${String(r.codeOnly).padStart(4)} code  / ${String(r.nonEmpty).padStart(4)} non-empty / ${String(r.lines).padStart(4)} total`);
console.log('  ' + '─'.repeat(60));
console.log(`  ${'TOTAL'.padEnd(24)} ${String(totalCode).padStart(4)} code  / ${String(totalNonEmpty).padStart(4)} non-empty / ${String(totalLines).padStart(4)} total\n`);
console.log(`I1  본체 LoC (comments 제외):  ${totalCode}  (limit < ${I1_LIMIT})   ${i1Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`I3  minified (lit external):  ${kb(minified.length)}`);
console.log(`I3  minified + gzip:          ${kb(gzipped.length)}  (limit < ${I3_LIMIT_KB} KB)   ${i3Pass ? '✅ PASS' : '❌ FAIL'}\n`);

process.exit(i1Pass && i3Pass ? 0 : 1);
