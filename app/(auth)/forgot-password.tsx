import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme() || 'light';
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPassword = () => {
    // Validate email
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // In a real app, this would make an API call to send a password reset email
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleBackToLogin = () => {
    router.back();
  };

  if (isSubmitted) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].background }]}>
        <View style={styles.successContainer}>
          <Ionicons 
            name="checkmark-circle" 
            size={80} 
            color={Colors[colorScheme as 'light' | 'dark'].accent} 
          />
          <Text style={[styles.successTitle, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
            Reset Link Sent
          </Text>
          <Text style={[styles.successMessage, { color: Colors[colorScheme as 'light' | 'dark'].tabIconDefault }]}>
            We've sent password reset instructions to {email}. Please check your email inbox.
          </Text>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].accent }]}
            onPress={handleBackToLogin}
          >
            <Text style={styles.backButtonText}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].background }]}>
      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
          Reset Password
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme as 'light' | 'dark'].tabIconDefault }]}>
          Enter your email and we'll send you instructions to reset your password
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons 
            name="mail-outline" 
            size={22} 
            color={Colors[colorScheme as 'light' | 'dark'].tabIconDefault} 
            style={styles.inputIcon}
          />
          <TextInput
            style={[
              styles.input,
              { 
                color: Colors[colorScheme as 'light' | 'dark'].text,
                backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary,
                borderColor: '#eeeeee',
              }
            ]}
            placeholder="Email Address"
            placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[
            styles.resetButton,
            { backgroundColor: Colors[colorScheme as 'light' | 'dark'].accent },
            isLoading && styles.resetButtonDisabled
          ]}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          <Text style={styles.resetButtonText}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity 
          style={styles.loginLinkContainer}
          onPress={handleBackToLogin}
        >
          <Text style={[styles.loginLinkText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
            Remember your password?{' '}
            <Text style={[styles.loginLink, { color: Colors[colorScheme as 'light' | 'dark'].accent }]}>
              Sign In
            </Text>
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
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 45,
    paddingRight: 10,
    fontSize: 16,
  },
  resetButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    marginTop: 10,
  },
  loginLinkText: {
    fontSize: 15,
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 