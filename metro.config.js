// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Explicitly set the project root
config.projectRoot = path.resolve(__dirname);

// Get the default source extensions
const defaultSourceExts = config.resolver.sourceExts || [];

// Add resolver options to improve module resolution
config.resolver = {
  ...config.resolver,
  // Ensure mjs is included for newer package formats
  sourceExts: [...defaultSourceExts, 'mjs'],
  // Prioritize browser and module fields for web/ESM compatibility
  resolverMainFields: ['browser', 'module', 'main'],
  extraNodeModules: {
    '@': path.resolve(__dirname),
  },
};

module.exports = config; 