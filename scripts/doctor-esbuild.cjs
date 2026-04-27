#!/usr/bin/env node
const { existsSync, readFileSync, rmSync } = require('node:fs');
const { spawnSync } = require('node:child_process');

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (typeof result.status === 'number') {
    return result.status;
  }

  return 1;
}

function removePath(pathname) {
  if (!existsSync(pathname)) {
    return;
  }

  rmSync(pathname, { recursive: true, force: true });
}

function getLockedEsbuildVersion() {
  if (!existsSync('package-lock.json')) {
    return null;
  }

  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  const version = lock?.packages?.['node_modules/esbuild']?.version;
  return typeof version === 'string' && version.length > 0 ? version : null;
}

console.log('[doctor:esbuild] Attempting targeted rebuild...');
let status = run('npm', ['rebuild', 'esbuild']);

if (status !== 0) {
  console.warn('[doctor:esbuild] Rebuild failed. This often means node_modules was copied from another OS/CPU.');
  console.warn('[doctor:esbuild] Cleaning esbuild artifacts...');

  removePath('node_modules/esbuild');
  removePath('node_modules/@esbuild');

  const lockedVersion = getLockedEsbuildVersion();
  if (lockedVersion) {
    console.warn(`[doctor:esbuild] Reinstalling locked esbuild@${lockedVersion} without touching other dependencies...`);
    status = run('npm', ['install', '--no-save', `esbuild@${lockedVersion}`]);
  }

  if (status !== 0) {
    console.warn('[doctor:esbuild] Targeted reinstall failed. Reinstalling dependencies from lockfile...');
    status = run('npm', ['ci']);
  }

  if (status !== 0) {
    console.warn('[doctor:esbuild] npm ci failed (lockfile may be out of sync). Falling back to npm install...');
    status = run('npm', ['install']);
  }
}

if (status !== 0) {
  console.error('[doctor:esbuild] Unable to repair dependencies automatically.');
  process.exit(status);
}

const versionResult = spawnSync(
  process.execPath,
  ['-e', "console.log('esbuild', require('esbuild').version)"],
  { stdio: 'inherit' }
);

process.exit(versionResult.status ?? 1);
