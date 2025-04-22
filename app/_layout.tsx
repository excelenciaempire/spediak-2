import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

// Define the light theme based on Colors constant
const AppLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.secondary, // Use secondary for card backgrounds
    text: Colors.light.text,
    border: Colors.light.lightGrey, // Use lightGrey for borders
    notification: Colors.light.primary,
  },
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // TODO: Verify/Add Helvetica or Arial fonts here based on Frontend Guidelines
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Don't redirect until auth state is loaded

    if (!user) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else {
      // Redirect to the main app screen if authenticated
      router.replace('/(app)');
    }
  }, [user, isLoading]);

  return (
    // Always use the light theme
    <ThemeProvider value={AppLightTheme}>
      <Stack>
        {/* Define screens accessible to all users (e.g., auth screens) */}
        {/* These will inherit the theme */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

// Fallback Error Boundary component
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: Colors.light.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      <Text style={{ 
        fontSize: 22, 
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 10
      }}>
        Oops! Something went wrong
      </Text>
      <Text style={{ 
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: 20
      }}>
        {error.message || 'An unexpected error occurred.'}
      </Text>
      <Text style={{ 
        color: Colors.light.tabIconDefault,
        fontSize: 12,
        marginTop: 10
      }}>
        Please restart the app or contact support if the issue persists.
      </Text>
    </View>
  );
}
