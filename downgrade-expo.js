const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Downgrading Expo to a version without project root issues...');

// Save the current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const originalPackageJson = fs.readFileSync(packageJsonPath, 'utf8');
const packageJson = JSON.parse(originalPackageJson);

// Store original versions
const originalExpoVersion = packageJson.dependencies.expo;
const originalExpoRouterVersion = packageJson.dependencies['expo-router'];

// Update to known working versions
packageJson.dependencies.expo = '~49.0.0';
packageJson.dependencies['expo-router'] = '~3.0.0';
packageJson.dependencies['react-native'] = '0.72.6';
packageJson.dependencies['react'] = '18.2.0';
packageJson.dependencies['react-dom'] = '18.2.0';
packageJson.dependencies['react-native-reanimated'] = '~3.3.0';
packageJson.dependencies['react-native-gesture-handler'] = '~2.12.0';
packageJson.dependencies['react-native-screens'] = '~3.22.0';
packageJson.dependencies['react-native-safe-area-context'] = '4.6.3';

// Update devDependencies too
if (packageJson.devDependencies) {
  packageJson.devDependencies['react-test-renderer'] = '18.2.0';
}

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

try {
  // Install the updated dependencies with --force flag
  console.log('Installing downgraded dependencies (with --force flag)...');
  execSync('npm install --force', { stdio: 'inherit' });
  
  console.log('\nDowngrade complete! Try running your app with:');
  console.log('npx expo start --clear');
  
  // Ask if they want to restore original versions
  console.log('\nTo restore original versions, run:');
  console.log('node restore-expo.js');
  
  // Create a restore script
  const restoreScript = `
  const fs = require('fs');
  const path = require('path');
  const { execSync } = require('child_process');

  console.log('Restoring original Expo versions...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Restore original versions
  packageJson.dependencies.expo = '${originalExpoVersion}';
  packageJson.dependencies['expo-router'] = '${originalExpoRouterVersion}';
  packageJson.dependencies['react-native'] = '0.76.9';
  packageJson.dependencies['react'] = '18.3.1';
  packageJson.dependencies['react-dom'] = '18.3.1';
  
  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log('Installing original dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\\nRestore complete!');
  `;
  
  fs.writeFileSync(path.join(__dirname, 'restore-expo.js'), restoreScript);
  
} catch (error) {
  console.error('Error downgrading Expo:', error.message);
  
  // Restore the original package.json
  fs.writeFileSync(packageJsonPath, originalPackageJson);
} 