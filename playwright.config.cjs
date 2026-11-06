const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  // Software-rendered graphics on shared CI runners take longer than local runs.
  timeout: process.env.CI ? (process.arch === 'arm64' && process.env.SNAPJOY_PACKAGE_ARCH === 'x64' ? 180000 : 120000) : 60000,
  expect: { timeout: 15000 },
  workers: 1,
  maxFailures: process.env.CI ? 1 : 0,
  reporter: 'list',
  fullyParallel: false,
  use: { trace: 'retain-on-failure' }
});
