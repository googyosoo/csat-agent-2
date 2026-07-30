const serverApp = require('./serverApp.js');
const app = serverApp.default || serverApp;

module.exports = (req, res) => {
  return app(req, res);
};
