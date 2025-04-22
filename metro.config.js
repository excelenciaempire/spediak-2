// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Explicitly set the project root
config.projectRoot = path.resolve(__dirname);

// Add resolver options to improve module resolution
config.resolver = {
  ...config.resolver,
  sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json'],
  extraNodeModules: {
    '@': path.resolve(__dirname),
  },
};

module.exports = config; 