/**
 * Always returns colors from the light theme to enforce consistent light mode appearance
 */

import { Colors } from '@/constants/Colors';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light
) {
  // Always use light theme
  const colorFromProps = props.light;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors.light[colorName];
  }
}
