const expressApp = require('../dist/server.cjs');
const app = expressApp.default || expressApp;

module.exports = app;
