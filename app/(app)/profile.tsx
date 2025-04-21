import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/services/api';
import { useNavigation } from '@react-navigation/native';
import DrawerButton from '@/components/DrawerButton';

export default function ProfileSettingsScreen() {
  const colorScheme = useColorScheme() || 'light';
  const { user, token } = useAuth();
  const navigation = useNavigation();
  
  // Set up the drawer menu button in the header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <DrawerButton />,
    });
  }, [navigation]);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('North Carolina');
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile when component mounts
  const fetchUserProfile = useCallback(async () => {
    if (!user || !token) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await userApi.getProfile(user.id, token);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch profile');
      }
      
      const userData = response.data.user;
      
      // Update local state with user data
      setFullName(userData.fullName || '');
      setEmail(userData.email || '');
      setState(userData.state || 'North Carolina');
      setProfileImageUrl(userData.profileImageUrl || undefined);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handlePasswordChange = async () => {
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

    // Password strength validation - at least 8 characters
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (!user || !token) {
      Alert.alert('Error', 'You must be logged in to change your password');
      return;
    }

    setIsChangingPassword(true);
    setError(null);

    try {
      const response = await userApi.updatePassword(
        user.id,
        currentPassword,
        newPassword,
        token
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update password');
      }
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      Alert.alert('Success', 'Password updated successfully');
    } catch (error: any) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !token) {
      Alert.alert('Error', 'You must be logged in to update your profile');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await userApi.updateProfile(
        user.id,
        {
          fullName,
          state,
          profileImageUrl
        },
        token
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update profile');
      }
      
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

  const pickImage = async () => {
    if (!isEditing) {
      Alert.alert('Info', 'Enable edit mode to change your profile picture');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      // In a production app, we would upload this to a storage service
      // and update the profileImageUrl with the cloud URL
      setProfileImageUrl(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (!isEditing) {
      Alert.alert('Info', 'Enable edit mode to change your profile picture');
      return;
    }
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      // In a production app, we would upload this to a storage service
      setProfileImageUrl(result.assets[0].uri);
    }
  };

  const changeProfilePicture = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme as 'light' | 'dark'].accent} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors[colorScheme as 'light' | 'dark'].error }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].accent }]}
            onPress={fetchUserProfile}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Image Section */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={changeProfilePicture} disabled={!isEditing || isSaving}>
          {profileImageUrl ? (
            <Image
              source={{ uri: profileImageUrl }}
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
                {fullName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          )}
          {isEditing && (
            <View style={[styles.editBadge, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].accent }]}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Form */}
      <View style={styles.formSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
            Personal Information
          </Text>
          <TouchableOpacity onPress={toggleEdit} disabled={isSaving}>
            <Text style={[styles.editButton, { color: Colors[colorScheme as 'light' | 'dark'].accent }]}>
              {isEditing ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
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
            editable={isEditing && !isSaving}
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
              enabled={isEditing && !isSaving}
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
                { 
                  color: Colors[colorScheme as 'light' | 'dark'].text,
                  backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary
                }
              ]}
              placeholder="Enter current password"
              placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!passwordVisible}
              editable={!isChangingPassword}
            />
            <TouchableOpacity
              style={styles.passwordVisibilityToggle}
              onPress={() => setPasswordVisible(!passwordVisible)}
              disabled={isChangingPassword}
            >
              <Ionicons
                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
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
                backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary
              }
            ]}
            placeholder="Enter new password"
            placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!passwordVisible}
            editable={!isChangingPassword}
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
                backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary
              }
            ]}
            placeholder="Confirm new password"
            placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!passwordVisible}
            editable={!isChangingPassword}
          />
        </View>

        {/* Change Password Button */}
        <TouchableOpacity
          style={[
            styles.changePasswordButton,
            { backgroundColor: Colors[colorScheme as 'light' | 'dark'].accent },
            isChangingPassword && styles.disabledButton
          ]}
          onPress={handlePasswordChange}
          disabled={isChangingPassword}
        >
          {isChangingPassword ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.changePasswordButtonText}>Change Password</Text>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  defaultProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  formSection: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  readOnlyInput: {
    opacity: 0.7,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordVisibilityToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  changePasswordButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  changePasswordButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 