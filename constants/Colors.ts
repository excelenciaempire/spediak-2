/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Colors for Spediak App based on Frontend Guidelines
 * Primary: #0D47A1 (Deep Blue)
 * Secondary: #EEEEEE (Light Gray)
 * Background: #FFFFFF (White)
 * Text: #333333 (Dark Text)
 */

export const Colors = {
  light: {
    text: '#333333', // Dark Text
    background: '#FFFFFF', // White Background
    tint: '#0D47A1', // Primary Deep Blue
    accent: '#0D47A1', // Using Primary as accent
    error: '#D9534F', // Keeping Error/Alert
    secondary: '#EEEEEE', // Light Gray
    icon: '#0D47A1',
    tabIconDefault: '#999999',
    tabIconSelected: '#0D47A1',
  },
  dark: {
    text: '#FFFFFF', // White Text
    background: '#333333', // Dark Background
    tint: '#0D47A1', // Primary Deep Blue
    accent: '#0D47A1', // Using Primary as accent
    error: '#D9534F', // Keeping Error/Alert
    secondary: '#EEEEEE', // Light Gray
    icon: '#FFFFFF',
    tabIconDefault: '#BBBBBB',
    tabIconSelected: '#0D47A1',
  },
};
