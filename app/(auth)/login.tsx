import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const colorScheme = useColorScheme() || 'light';
  const router = useRouter();
  const { login, error, isLoading, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Clear any auth errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Show error alert if there's an authentication error
  useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error);
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

    // Use the login function from AuthContext
    await login(email, password);
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Social Login', `${provider} login will be implemented in production`);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={[styles.container, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].background }]}
    >
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: Colors[colorScheme as 'light' | 'dark'].tint }]}>
          Spediak
        </Text>
        <Text style={[styles.tagline, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
          Professional DDID Statements
        </Text>
      </View>

      <View style={styles.formContainer}>
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
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons 
            name="lock-closed-outline" 
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
            placeholder="Password"
            placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.passwordVisibilityToggle}
            onPress={() => setPasswordVisible(!passwordVisible)}
            disabled={isLoading}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotPasswordContainer} disabled={isLoading}>
            <Text style={[styles.forgotPasswordText, { color: Colors[colorScheme as 'light' | 'dark'].accent }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Login Button */}
        <TouchableOpacity
          style={[
            styles.loginButton,
            { backgroundColor: Colors[colorScheme as 'light' | 'dark'].accent },
            isLoading && styles.loginButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].tabIconDefault }]} />
          <Text style={[styles.dividerText, { color: Colors[colorScheme as 'light' | 'dark'].tabIconDefault }]}>
            or sign in with
          </Text>
          <View style={[styles.divider, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].tabIconDefault }]} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.socialButton,
              { backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary }
            ]}
            onPress={() => handleSocialLogin('Google')}
            disabled={isLoading}
          >
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
              style={styles.socialIcon}
            />
            <Text style={[styles.socialButtonText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
              Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.socialButton,
              { backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary }
            ]}
            onPress={() => handleSocialLogin('Facebook')}
            disabled={isLoading}
          >
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg' }}
              style={styles.socialIcon}
            />
            <Text style={[styles.socialButtonText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
              Facebook
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
            Don't have an account?
          </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity disabled={isLoading}>
              <Text style={[styles.signupLink, { color: Colors[colorScheme as 'light' | 'dark'].accent }]}>
                Sign Up
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
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