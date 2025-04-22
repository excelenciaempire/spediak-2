import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import DrawerButton from '@/components/DrawerButton';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/services/api';

// List of states for the picker
const STATES = [
  'North Carolina',
  'South Carolina',
];

export default function ProfileSettingsScreen() {
  // Will always return 'light'
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { user, token, logout } = useAuth();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email] = useState(user?.email || ''); // Email is read-only
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState(user?.state || 'North Carolina');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(user?.profileImageUrl || null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Add validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Add loading states
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setState(user.state);
      setProfileImageUrl(user.profileImageUrl);
    }
  }, [user]);

  // Set up the drawer menu button in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <DrawerButton />,
    });
  }, [navigation]);

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }
    
    if (!state) {
      newErrors.state = 'Please select a state';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) {
      return;
    }
    setIsPasswordLoading(true);
    setErrors({});
    try {
      const response = await userApi.updatePassword(newPassword);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update password');
      }
      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password. Please try again.');
      setErrors({ apiError: error.message });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateProfile() || !user || !token) {
      return;
    }
    
    setIsProfileLoading(true);
    
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
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update profile');
      }
      
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
      setErrors({});
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsProfileLoading(false);
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

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          onPress: () => logout(),
          style: 'destructive'
        },
      ]
    );
  };

  const changeProfilePicture = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { 
          text: 'Take Photo', 
          onPress: () => {
            console.log('Take Photo pressed');
            // In a real app, this would use expo-image-picker to take a photo
            // and then upload it to a server, getting a URL back
            // For now, we'll just simulate this with a mock URL
            setProfileImageUrl('https://randomuser.me/api/portraits/men/1.jpg');
          } 
        },
        { 
          text: 'Choose from Gallery', 
          onPress: () => {
            console.log('Gallery pressed');
            // In a real app, this would use expo-image-picker to select from gallery
            // and then upload it to a server, getting a URL back
            // For now, we'll just simulate this with a mock URL
            setProfileImageUrl('https://randomuser.me/api/portraits/men/2.jpg');
          } 
        },
        { 
          text: 'Remove Photo', 
          onPress: () => {
            console.log('Remove Photo pressed');
            setProfileImageUrl(null);
          },
          style: 'destructive'
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };
  
  // If no user, show loading
  if (!user) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors.light.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile Image Section */}
      <View style={styles.profileImageContainer}>
        {profileImageUrl ? (
          <Image 
            source={{ uri: profileImageUrl }} 
            style={styles.profileImage} 
          />
        ) : (
          <View style={[styles.profileImagePlaceholder, { backgroundColor: Colors.light.tabIconDefault }]}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.changeImageButton, { backgroundColor: Colors.light.accent }]}
          onPress={changeProfilePicture}
        >
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Add Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={22} color={Colors.light.danger} />
        <Text style={[styles.logoutButtonText, { color: Colors.light.danger }]}>
          Log Out
        </Text>
      </TouchableOpacity>

      {/* Display API Errors */}
       {errors.apiError && (
          <View style={[styles.apiErrorContainer, { backgroundColor: 'rgba(255, 0, 0, 0.1)' }]}>
             <Text style={[styles.errorText, { color: Colors.light.danger }]}>{errors.apiError}</Text>
          </View>
       )}

      {/* Profile Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
            Profile Information
          </Text>
          <TouchableOpacity onPress={toggleEdit}>
            <Text style={[styles.editButton, { color: Colors.light.accent }]}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Email */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors.light.tabIconDefault }]}>
            Email
          </Text>
          <TextInput
            style={[
              styles.fieldInput,
              { color: Colors.light.tabIconDefault, backgroundColor: Colors.light.secondary }
            ]}
            value={email}
            editable={false}
          />
        </View>
        
        {/* Full Name */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors.light.tabIconDefault }]}>
            Full Name
          </Text>
          <TextInput
            style={[
              styles.fieldInput,
              { 
                color: Colors.light.text, 
                backgroundColor: isEditing ? Colors.light.secondary : 'transparent',
                borderColor: isEditing ? Colors.light.tabIconDefault : 'transparent',
                borderWidth: isEditing ? 1 : 0,
              }
            ]}
            value={fullName}
            onChangeText={setFullName}
            editable={isEditing}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.light.tabIconDefault}
          />
          {errors.fullName && (
            <Text style={[styles.errorText, { color: Colors.light.danger }]}>
              {errors.fullName}
            </Text>
          )}
        </View>
        
        {/* State */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors.light.tabIconDefault }]}>
            State
          </Text>
          {isEditing ? (
            <View style={[
              styles.pickerContainer, 
              { backgroundColor: Colors.light.secondary, borderColor: Colors.light.tabIconDefault, borderWidth: 1 }
            ]}>
              <Picker
                selectedValue={state}
                onValueChange={(itemValue: string) => setState(itemValue)}
                enabled={isEditing}
                style={[styles.picker, { color: Colors.light.text }]}
              >
                {STATES.map((stateName) => (
                  <Picker.Item key={stateName} label={stateName} value={stateName} />
                ))}
              </Picker>
            </View>
          ) : (
            <TextInput
              style={[
                styles.fieldInput,
                { color: Colors.light.text, backgroundColor: 'transparent' }
              ]}
              value={state}
              editable={false}
            />
          )}
          {errors.state && (
            <Text style={[styles.errorText, { color: Colors.light.danger }]}>
              {errors.state}
            </Text>
          )}
        </View>
      </View>
      
      {/* Password Section */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
          Change Password
        </Text>
        
        {/* Current Password */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors.light.tabIconDefault }]}>
            Current Password
          </Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[
                styles.fieldInput,
                { color: Colors.light.text, backgroundColor: Colors.light.secondary, borderColor: Colors.light.tabIconDefault, borderWidth: 1 }
              ]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!passwordVisible}
              placeholder="Enter current password"
              placeholderTextColor={Colors.light.tabIconDefault}
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
          {errors.currentPassword && (
            <Text style={[styles.errorText, { color: Colors.light.danger }]}>
              {errors.currentPassword}
            </Text>
          )}
        </View>
        
        {/* New Password */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors.light.tabIconDefault }]}>
            New Password
          </Text>
          <TextInput
            style={[
              styles.fieldInput,
              { color: Colors.light.text, backgroundColor: Colors.light.secondary, borderColor: Colors.light.tabIconDefault, borderWidth: 1 }
            ]}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!passwordVisible}
            placeholder="Enter new password"
            placeholderTextColor={Colors.light.tabIconDefault}
          />
          {errors.newPassword && (
            <Text style={[styles.errorText, { color: Colors.light.danger }]}>
              {errors.newPassword}
            </Text>
          )}
        </View>
        
        {/* Confirm New Password */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors.light.tabIconDefault }]}>
            Confirm New Password
          </Text>
          <TextInput
            style={[
              styles.fieldInput,
              { color: Colors.light.text, backgroundColor: Colors.light.secondary, borderColor: Colors.light.tabIconDefault, borderWidth: 1 }
            ]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!passwordVisible}
            placeholder="Confirm new password"
            placeholderTextColor={Colors.light.tabIconDefault}
          />
          {errors.confirmPassword && (
            <Text style={[styles.errorText, { color: Colors.light.danger }]}>
              {errors.confirmPassword}
            </Text>
          )}
        </View>
        
        {/* Update Password Button */}
        <TouchableOpacity
          style={[
            styles.updateButton,
            { backgroundColor: Colors.light.accent },
            isPasswordLoading && styles.updateButtonDisabled
          ]}
          onPress={handlePasswordChange}
          disabled={isPasswordLoading}
        >
          <Text style={styles.updateButtonText}>
            {isPasswordLoading ? 'Updating...' : 'Update Password'}
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
    padding: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomColor: Colors.light.tabIconDefault,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  fieldInput: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordVisibilityToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  updateButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  apiErrorContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center'
  },
}); 