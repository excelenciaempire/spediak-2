const path = require('path');

module.exports = ({ config }) => {
  return {
    ...config,
    _internal: {
      ...(config._internal || {}),
      projectRoot: path.resolve(__dirname),
    },
  };
}; 