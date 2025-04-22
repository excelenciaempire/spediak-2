
  const fs = require('fs');
  const path = require('path');
  const { execSync } = require('child_process');

  console.log('Restoring original Expo versions...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Restore original versions
  packageJson.dependencies.expo = '^52.0.46';
  packageJson.dependencies['expo-router'] = '^4.0.20';
  packageJson.dependencies['react-native'] = '0.76.9';
  packageJson.dependencies['react'] = '18.3.1';
  packageJson.dependencies['react-dom'] = '18.3.1';
  
  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log('Installing original dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\nRestore complete!');
  