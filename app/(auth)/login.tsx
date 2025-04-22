import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const colorScheme = useColorScheme() || 'light';
  const { login, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Clear any previous errors when component mounts or unmounts
  React.useEffect(() => {
    clearError();
    return () => clearError();
  }, []);

  // Show error alert if authentication fails
  React.useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
    }
  }, [error]);

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Call the login function from AuthContext
    await login(email, password);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={[styles.container, { backgroundColor: Colors.light.background }]}
    >
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: Colors.light.tint }]}>
          Spediak
        </Text>
        <Text style={[styles.tagline, { color: Colors.light.text }]}>
          Professional DDID Statements
        </Text>
      </View>

      <View style={styles.formContainer}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons 
            name="mail-outline" 
            size={22} 
            color={Colors.light.tabIconDefault} 
            style={styles.inputIcon}
          />
          <TextInput
            style={[
              styles.input,
              { 
                color: Colors.light.text,
                backgroundColor: Colors.light.secondary,
                borderColor: '#eeeeee',
              }
            ]}
            placeholder="Email Address"
            placeholderTextColor={Colors.light.tabIconDefault}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons 
            name="lock-closed-outline" 
            size={22} 
            color={Colors.light.tabIconDefault} 
            style={styles.inputIcon}
          />
          <TextInput
            style={[
              styles.input,
              { 
                color: Colors.light.text,
                backgroundColor: Colors.light.secondary,
                borderColor: '#eeeeee',
              }
            ]}
            placeholder="Password"
            placeholderTextColor={Colors.light.tabIconDefault}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            style={styles.passwordVisibilityToggle}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={Colors.light.tabIconDefault}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={[styles.forgotPasswordText, { color: Colors.light.accent }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Login Button */}
        <TouchableOpacity
          style={[
            styles.loginButton,
            { backgroundColor: Colors.light.accent },
            isLoading && styles.loginButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: Colors.light.text }]}>
            Don't have an account?
          </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={[styles.signupLink, { color: Colors.light.accent }]}>
                {' Sign Up'}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    marginTop: 8,
  },
  formContainer: {
    paddingHorizontal: 24,
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
  passwordVisibilityToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    fontSize: 15,
  },
  signupLink: {
    fontSize: 15,
    fontWeight: '600',
  },
}); 