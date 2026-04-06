const { getDefaultConfig } = require('expo/metro-config');

// Polyfill for Node 18
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return this.slice().reverse();
  };
}

const config = getDefaultConfig(__dirname);

module.exports = config;
