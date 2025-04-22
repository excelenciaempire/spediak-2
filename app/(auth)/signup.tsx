import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const colorScheme = useColorScheme() || 'light';
  const { signup, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('North Carolina');
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Clear any previous errors when component mounts or unmounts
  React.useEffect(() => {
    clearError();
    return () => clearError();
  }, []);

  // Show error alert if registration fails
  React.useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error);
    }
  }, [error]);

  const handleSignup = async () => {
    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Password matching validation
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Password strength validation - at least 8 characters
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // Call the signup function from AuthContext
    await signup(email, password, fullName, state);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={[styles.container, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].background }]}
    >
      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
          Create Your Account
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme as 'light' | 'dark'].tabIconDefault }]}>
          Please fill in the details below to get started
        </Text>

        {/* Full Name Input */}
        <View style={styles.inputContainer}>
          <Ionicons 
            name="person-outline" 
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
            placeholder="Full Name"
            placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

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
          />
          <TouchableOpacity
            style={styles.passwordVisibilityToggle}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
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
            placeholder="Confirm Password"
            placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!passwordVisible}
          />
        </View>

        {/* State Selection */}
        <View style={styles.inputContainer}>
          <Ionicons 
            name="location-outline" 
            size={22} 
            color={Colors[colorScheme as 'light' | 'dark'].tabIconDefault} 
            style={styles.inputIcon}
          />
          <View 
            style={[
              styles.pickerContainer, 
              { 
                backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary,
                borderColor: '#eeeeee',
              }
            ]}
          >
            <Picker
              selectedValue={state}
              onValueChange={(itemValue: string) => setState(itemValue)}
              style={[
                styles.picker, 
                { color: Colors[colorScheme as 'light' | 'dark'].text }
              ]}
              dropdownIconColor={Colors[colorScheme as 'light' | 'dark'].text}
            >
              <Picker.Item label="North Carolina" value="North Carolina" />
              <Picker.Item label="South Carolina" value="South Carolina" />
            </Picker>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Text style={[styles.termsText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
            By signing up, you agree to our{' '}
            <Text style={[styles.termsLink, { color: Colors[colorScheme as 'light' | 'dark'].accent }]}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={[styles.termsLink, { color: Colors[colorScheme as 'light' | 'dark'].accent }]}>
              Privacy Policy
            </Text>
          </Text>
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          style={[
            styles.signupButton,
            { backgroundColor: Colors[colorScheme as 'light' | 'dark'].accent },
            isLoading && styles.signupButtonDisabled
          ]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={styles.signupButtonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        {/* Already have an account */}
        <TouchableOpacity 
          style={styles.loginLinkContainer}
          onPress={() => router.back()}
        >
          <Text style={[styles.loginLinkText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
            Already have an account?{' '}
            <Text style={[styles.loginLink, { color: Colors[colorScheme as 'light' | 'dark'].accent }]}>
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>
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
    paddingVertical: 20,
  },
  formContainer: {
    paddingHorizontal: 24,
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    paddingLeft: 35,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  signupButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    marginBottom: 30,
  },
  loginLinkText: {
    fontSize: 15,
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: '600',
  },
}); 