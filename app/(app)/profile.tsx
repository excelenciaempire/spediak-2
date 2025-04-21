import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// Mock user data
const MOCK_USER = {
  fullName: 'John Smith',
  email: 'john.smith@example.com',
  state: 'North Carolina',
  profileImageUrl: null, // Default is null, can be a URL
};

export default function ProfileSettingsScreen() {
  const colorScheme = useColorScheme() || 'light';
  const [fullName, setFullName] = useState(MOCK_USER.fullName);
  const [email] = useState(MOCK_USER.email); // Email is read-only
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState(MOCK_USER.state);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handlePasswordChange = () => {
    // Validate password fields
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    // In a real app, this would call an API to update the password
    Alert.alert('Success', 'Password updated successfully');
    
    // Clear password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveProfile = () => {
    // In a real app, this would call an API to update the profile
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditing(false);
  };

  const toggleEdit = () => {
    if (isEditing) {
      // If currently editing, save changes
      handleSaveProfile();
    } else {
      // Start editing
      setIsEditing(true);
    }
  };

  const changeProfilePicture = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => console.log('Take Photo pressed') },
        { text: 'Choose from Gallery', onPress: () => console.log('Gallery pressed') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile Image Section */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={changeProfilePicture}>
          {MOCK_USER.profileImageUrl ? (
            <Image
              source={{ uri: MOCK_USER.profileImageUrl }}
              style={styles.profileImage}
            />
          ) : (
            <View 
              style={[
                styles.defaultProfileImage, 
                { backgroundColor: Colors[colorScheme as 'light' | 'dark'].tint }
              ]}
            >
              <Text style={[styles.profileInitials, { color: Colors[colorScheme as 'light' | 'dark'].secondary }]}>
                {MOCK_USER.fullName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].accent }]}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Profile Form */}
      <View style={styles.formSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
            Personal Information
          </Text>
          <TouchableOpacity onPress={toggleEdit}>
            <Text style={[styles.editButton, { color: Colors[colorScheme as 'light' | 'dark'].accent }]}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Full Name Field */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>Full Name</Text>
          <TextInput
            style={[
              styles.input,
              { 
                color: Colors[colorScheme as 'light' | 'dark'].text,
                backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary,
                borderColor: isEditing ? Colors[colorScheme as 'light' | 'dark'].accent : '#eeeeee',
              }
            ]}
            value={fullName}
            onChangeText={setFullName}
            editable={isEditing}
          />
        </View>

        {/* Email Field (Read-only) */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              styles.readOnlyInput,
              { 
                color: Colors[colorScheme as 'light' | 'dark'].tabIconDefault,
                backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary,
                borderColor: '#eeeeee',
              }
            ]}
            value={email}
            editable={false}
          />
        </View>

        {/* State Selection */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>State</Text>
          <View 
            style={[
              styles.pickerContainer, 
              { 
                backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary,
                borderColor: isEditing ? Colors[colorScheme as 'light' | 'dark'].accent : '#eeeeee',
              }
            ]}
          >
            <Picker
              selectedValue={state}
              onValueChange={(itemValue: string) => setState(itemValue)}
              enabled={isEditing}
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
      </View>

      {/* Password Section */}
      <View style={styles.formSection}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
          Change Password
        </Text>

        {/* Current Password */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>Current Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                { 
                  color: Colors[colorScheme as 'light' | 'dark'].text,
                  backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary,
                  borderColor: '#eeeeee',
                }
              ]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!passwordVisible}
              placeholder="Enter current password"
              placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
            />
            <TouchableOpacity
              style={styles.passwordVisibility}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? 'eye-off' : 'eye'}
                size={22}
                color={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>New Password</Text>
          <TextInput
            style={[
              styles.input,
              { 
                color: Colors[colorScheme as 'light' | 'dark'].text,
                backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary,
                borderColor: '#eeeeee',
              }
            ]}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!passwordVisible}
            placeholder="Enter new password"
            placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
          />
        </View>

        {/* Confirm New Password */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>Confirm New Password</Text>
          <TextInput
            style={[
              styles.input,
              { 
                color: Colors[colorScheme as 'light' | 'dark'].text,
                backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary,
                borderColor: '#eeeeee',
              }
            ]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!passwordVisible}
            placeholder="Confirm new password"
            placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.updatePasswordButton,
            { backgroundColor: Colors[colorScheme as 'light' | 'dark'].accent }
          ]}
          onPress={handlePasswordChange}
        >
          <Text style={styles.updatePasswordButtonText}>
            Update Password
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
  contentContainer: {
    padding: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  readOnlyInput: {
    opacity: 0.7,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50, // Space for the visibility toggle
  },
  passwordVisibility: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  updatePasswordButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  updatePasswordButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 