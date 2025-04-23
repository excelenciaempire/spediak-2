import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

export default function LogoutScreen() {
  const colorScheme = useColorScheme() || 'light';
  const router = useRouter();

  useEffect(() => {
    // Simulate logout process:
    // 1. Clear any session tokens (would be implemented in a real app)
    // 2. Reset any cached app state
    // 3. Redirect to login screen
    
    const logoutProcess = async () => {
      try {
        // In a real app, you'd have code like:
        // await SecureStore.deleteItemAsync('userToken');
        // await clearUserData();
        
        // Simulate some logout processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirect to login screen
        router.replace('/(auth)/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Even on error, we should try to get the user to the login screen
        router.replace('/(auth)/login');
      }
    };
    
    logoutProcess();
  }, [router]);

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: Colors[colorScheme].background }
      ]}
    >
      <ActivityIndicator 
        size="large" 
        color={Colors[colorScheme].accent} 
      />
      <Text 
        style={[
          styles.message, 
          { color: Colors[colorScheme].text }
        ]}
      >
        Logging you out...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
}); 