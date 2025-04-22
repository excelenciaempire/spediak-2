const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.EXPO_PROJECT_ROOT = path.resolve(__dirname);
console.log('Setting EXPO_PROJECT_ROOT to:', process.env.EXPO_PROJECT_ROOT);

// Start expo with the environment variable
const expo = spawn('npx', ['expo', 'start', '--clear'], {
  stdio: 'inherit',
  env: process.env
});

expo.on('error', (err) => {
  console.error('Failed to start Expo:', err);
});

process.on('SIGINT', () => {
  expo.kill('SIGINT');
}); 