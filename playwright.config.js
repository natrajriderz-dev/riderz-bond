// playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
  },
  webServer: {
    command: '/home/natzridz/.config/nvm/versions/node/v22.17.0/bin/npx http-server dist -p 8081',
    port: 8081,
    reuseExistingServer: true,
  },
};
