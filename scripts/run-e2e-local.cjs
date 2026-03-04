#!/usr/bin/env node
const { spawn } = require('node:child_process');

const isProduction = (process.env.NODE_ENV || '').toLowerCase() === 'production';
const isCI = ['1', 'true', 'yes'].includes((process.env.CI || '').toLowerCase());

if (isProduction || isCI) {
  const reasons = [];
  if (isProduction) reasons.push('NODE_ENV=production');
  if (isCI) reasons.push('CI=true');
  console.error(`Blocked: Playwright e2e is local-only (${reasons.join(', ')}).`);
  process.exit(1);
}

const passthroughArgs = process.argv.slice(2).join(' ');
const command = `npx playwright test ${passthroughArgs}`.trim();
const child = spawn(command, {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 1));
child.on('error', () => process.exit(1));
