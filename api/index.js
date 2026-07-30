const expressApp = require('./server.cjs');
const app = expressApp.default || expressApp;

module.exports = app;
