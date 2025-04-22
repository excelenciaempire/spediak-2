const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up native project...');

// First, check if we have ios/android directories already
const hasIos = fs.existsSync(path.join(__dirname, 'ios'));
const hasAndroid = fs.existsSync(path.join(__dirname, 'android'));

if (!hasIos && !hasAndroid) {
  // We need to temporarily add the projectRoot to app.json
  const appJsonPath = path.join(__dirname, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  // Add the _internal section if needed
  if (!appJson.expo._internal) {
    appJson.expo._internal = {};
  }
  
  // Set the projectRoot
  appJson.expo._internal.projectRoot = __dirname;
  
  // Write the updated app.json
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  
  try {
    // Run the prebuild command
    console.log('Running prebuild...');
    execSync('npx expo prebuild --no-install', { stdio: 'inherit' });
    
    console.log('\nNative project setup complete!');
    console.log('\nFor iOS:');
    console.log('1. Open the iOS folder in Xcode');
    console.log('2. Run the project from Xcode');
    
    console.log('\nFor Android:');
    console.log('1. Open the android folder in Android Studio');
    console.log('2. Run the project from Android Studio');
    
  } catch (error) {
    console.error('Error running prebuild:', error.message);
  } finally {
    // Restore the original app.json
    delete appJson.expo._internal.projectRoot;
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  }
} else {
  console.log('Native projects already exist!');
  console.log('\nFor iOS:');
  console.log('1. Open the iOS folder in Xcode');
  console.log('2. Run the project from Xcode');
  
  console.log('\nFor Android:');
  console.log('1. Open the android folder in Android Studio');
  console.log('2. Run the project from Android Studio');
} 