/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Colors for Spediak App based on User Request
 * Background: #FFFFFF (White)
 * Primary: #0D47A1 (Deep Blue)
 * Secondary: #EEEEEE (Light Gray)
 * Text: #333333 (Dark Gray)
 * Placeholder: #999999 (Light Gray)
 */

const primaryColor = '#0D47A1';
const secondaryColor = '#EEEEEE';
const backgroundColor = '#FFFFFF';
const textColor = '#333333';
const placeholderColor = '#999999';
const dangerColor = '#DC3545'; // Keep a standard danger color

export const Colors = {
  // Only defining light theme as requested
  light: {
    text: textColor,
    background: backgroundColor,
    tint: primaryColor,
    icon: textColor, // Use standard text color for icons unless specified otherwise
    tabIconDefault: placeholderColor, // Use placeholder for inactive tabs
    tabIconSelected: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: primaryColor, // Using primary as accent
    danger: dangerColor,
    warning: '#FFC107', // Keep standard warning
    info: '#17A2B8', // Keep standard info
    success: '#28A745', // Keep standard success
    grey: placeholderColor, // Use placeholder for general grey
    lightGrey: secondaryColor, // Map lightGrey to secondary
    placeholder: placeholderColor,
  },
  // Dark theme is intentionally left out to enforce light mode
  dark: {},
};
