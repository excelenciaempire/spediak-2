import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function VerifyEmailScreen() {
  const colorScheme = useColorScheme() || 'light';
  const router = useRouter();
  
  const [isResending, setIsResending] = useState(false);

  // Mock email from the signup form (in a real app would be passed via params or state)
  const mockEmail = 'user@example.com';

  const handleResendEmail = () => {
    setIsResending(true);

    // In a real app, this would make an API call to resend the verification email
    setTimeout(() => {
      setIsResending(false);
    }, 1500);
  };

  const handleContinueToLogin = () => {
    // In a real app, this would navigate to login screen
    router.push('/(auth)/login');
  };

  // For demo purposes, skip the verification and go to the app directly
  const handleSkipVerification = () => {
    router.replace('/(app)');
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].background }]}>
      <View style={styles.contentContainer}>
        <Ionicons 
          name="mail" 
          size={80} 
          color={Colors[colorScheme as 'light' | 'dark'].accent} 
        />
        <Text style={[styles.title, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
          Verify Your Email
        </Text>
        <Text style={[styles.message, { color: Colors[colorScheme as 'light' | 'dark'].tabIconDefault }]}>
          We've sent a verification link to {mockEmail}. Please check your email and verify your account.
        </Text>

        <TouchableOpacity
          style={[
            styles.resendButton,
            { borderColor: Colors[colorScheme as 'light' | 'dark'].accent },
          ]}
          onPress={handleResendEmail}
          disabled={isResending}
        >
          <Text style={[styles.resendButtonText, { color: Colors[colorScheme as 'light' | 'dark'].accent }]}>
            {isResending ? 'Sending...' : 'Resend Email'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: Colors[colorScheme as 'light' | 'dark'].accent },
          ]}
          onPress={handleContinueToLogin}
        >
          <Text style={styles.continueButtonText}>
            Continue to Login
          </Text>
        </TouchableOpacity>

        {/* For demo only */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipVerification}
        >
          <Text style={[styles.skipButtonText, { color: Colors[colorScheme as 'light' | 'dark'].tabIconDefault }]}>
            (Demo) Skip Verification
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  resendButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 40,
    padding: 8,
  },
  skipButtonText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
}); 