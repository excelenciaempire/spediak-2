const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Determine the project root
const projectRoot = path.resolve(__dirname);
console.log('Project root set to:', projectRoot);

// Create a temporary app.config.js that ensures the project root is set
const tempConfigContent = `
module.exports = ({ config }) => {
  return {
    ...config,
    _internal: {
      ...(config._internal || {}),
      projectRoot: "${projectRoot.replace(/\\/g, '\\\\')}"
    }
  };
};
`;

// Write the temporary config
fs.writeFileSync(path.join(projectRoot, 'temp-app.config.js'), tempConfigContent);

// Set environment variables
process.env.EXPO_PROJECT_ROOT = projectRoot;
process.env.EXPO_CONFIG_PATH = path.join(projectRoot, 'temp-app.config.js');

console.log('Starting Expo development server...');

// First, run expo prebuild to ensure correct setup
const prebuild = spawn('npx', ['expo', 'prebuild', '--no-install'], {
  stdio: 'inherit',
  env: process.env
});

prebuild.on('close', (code) => {
  if (code !== 0) {
    console.log('Prebuild failed, but continuing with startup...');
  }
  
  // Now start the development server
  const expo = spawn('npx', ['expo', 'start', '--dev-client', '--clear'], {
    stdio: 'inherit',
    env: process.env
  });

  expo.on('error', (err) => {
    console.error('Failed to start Expo:', err);
  });

  expo.on('close', () => {
    // Clean up temporary config file
    try {
      fs.unlinkSync(path.join(projectRoot, 'temp-app.config.js'));
    } catch (err) {
      // File might not exist, that's fine
    }
  });
});

// Handle termination
process.on('SIGINT', () => {
  // Clean up temporary config file
  try {
    fs.unlinkSync(path.join(projectRoot, 'temp-app.config.js'));
  } catch (err) {
    // File might not exist, that's fine
  }
  process.exit(0);
}); 