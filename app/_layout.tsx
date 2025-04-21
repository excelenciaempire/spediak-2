import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Drawer } from 'expo-router/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // We'll replace SpaceMono with Helvetica or Arial as per frontend guidelines
    // For now, we'll keep SpaceMono as a fallback
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen 
                name="(auth)" 
                options={{
                  // Auth screens don't need a gesture to dismiss
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen 
                name="(app)" 
                options={{
                  // Don't allow the user to swipe back to auth screens
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

// Fallback Error Boundary component
export function ErrorBoundary({ error }: { error: Error }) {
  const colorScheme = useColorScheme();
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: Colors[colorScheme || 'light'].background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      <Text style={{ 
        fontSize: 22, 
        fontWeight: 'bold',
        color: Colors[colorScheme || 'light'].text,
        marginBottom: 10
      }}>
        Oops! Something went wrong
      </Text>
      <Text style={{ 
        color: Colors[colorScheme || 'light'].text,
        textAlign: 'center',
        marginBottom: 20
      }}>
        {error.message || 'An unexpected error occurred.'}
      </Text>
      <Text style={{ 
        color: Colors[colorScheme || 'light'].tabIconDefault,
        fontSize: 12,
        marginTop: 10
      }}>
        Please restart the app or contact support if the issue persists.
      </Text>
    </View>
  );
}
