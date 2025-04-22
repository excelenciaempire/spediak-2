import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function AuthLayout() {
  // Will always return 'light'
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.tint,
        },
        headerTintColor: Colors.light.secondary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: Colors.light.background,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Sign In',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Create Account',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'Reset Password',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="verify-email"
        options={{
          title: 'Verify Email',
          headerShown: true,
        }}
      />
    </Stack>
  );
} 