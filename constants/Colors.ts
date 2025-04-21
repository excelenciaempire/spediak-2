/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Colors for Spediak App based on Frontend Guidelines
 * Primary: #0A2540 (Deep Navy Blue)
 * Secondary: #FFFFFF (Clean White)
 * Accent: #28A745 (Vibrant Green for actionable items)
 * Background: #F4F6F8 (Light, neutral tone)
 * Error/Alert: #D9534F (Soft Red)
 */

export const Colors = {
  light: {
    text: '#333333', // Dark Text
    background: '#F4F6F8', // Background
    tint: '#0A2540', // Primary
    accent: '#28A745', // Accent
    error: '#D9534F', // Error/Alert
    secondary: '#FFFFFF', // Secondary
    icon: '#0A2540',
    tabIconDefault: '#687076',
    tabIconSelected: '#0A2540',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0A2540', // Dark mode uses primary as background
    tint: '#FFFFFF', // Secondary becomes tint in dark mode
    accent: '#28A745', // Accent stays same
    error: '#D9534F', // Error/Alert stays same
    secondary: '#1E3A5F', // Darker shade of primary for secondary in dark mode
    icon: '#FFFFFF',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
  },
};
