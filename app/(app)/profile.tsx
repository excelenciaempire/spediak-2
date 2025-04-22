import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import DrawerButton from '@/components/DrawerButton';

// Mock user data
const MOCK_USER = {
  fullName: 'John Smith',
  email: 'john.smith@example.com',
  state: 'North Carolina',
  profileImageUrl: undefined, // Changed from null to undefined
};

// List of states for the picker
const STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export default function ProfileSettingsScreen() {
  // Will always return 'light'
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const [fullName, setFullName] = useState(MOCK_USER.fullName);
  const [email] = useState(MOCK_USER.email); // Email is read-only
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState(MOCK_USER.state);
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(MOCK_USER.profileImageUrl);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Add validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Add loading states
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would call an API to update the password
      Alert.alert('Success', 'Password updated successfully');
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (error) {
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      return;
    }
    
    setIsProfileLoading(true);
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would call an API to update the profile
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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
            setProfileImageUrl(undefined);
          },
          style: 'destructive'
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors.light.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile Image Section */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={changeProfilePicture}>
          {profileImageUrl ? (
            <Image
              source={{ uri: profileImageUrl }}
              style={styles.profileImage}
            />
          ) : (
            <View 
              style={[
                styles.defaultProfileImage, 
                { backgroundColor: Colors.light.tint }
              ]}
            >
              <Text style={[styles.profileInitials, { color: Colors.light.secondary }]}>
                {fullName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: Colors.light.accent }]}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Profile Form */}
      <View style={styles.formSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
            Personal Information
          </Text>
          <TouchableOpacity 
            onPress={toggleEdit}
            disabled={isProfileLoading}
          >
            <Text style={[styles.editButton, { color: Colors.light.accent }]}>
              {isEditing ? (isProfileLoading ? 'Saving...' : 'Save') : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Full Name Field */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors.light.text }]}>Full Name</Text>
          <TextInput
            style={[
              styles.input,
              { 
                color: Colors.light.text,
                backgroundColor: Colors.light.secondary,
                borderColor: errors.fullName ? Colors.light.error : isEditing ? Colors.light.accent : '#EEEEEE',
              }
            ]}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) {
                setErrors({...errors, fullName: ''});
              }
            }}
            editable={isEditing}
          />
          {errors.fullName ? (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          ) : null}
        </View>

        {/* Email Field (Read-only) */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors.light.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              styles.readOnlyInput,
              { 
                color: Colors.light.tabIconDefault,
                backgroundColor: Colors.light.secondary,
                borderColor: '#EEEEEE',
              }
            ]}
            value={email}
            editable={false}
          />
        </View>

        {/* State Selection */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors.light.text }]}>State</Text>
          <View 
            style={[
              styles.pickerContainer, 
              { 
                backgroundColor: Colors.light.secondary,
                borderColor: errors.state ? Colors.light.error : isEditing ? Colors.light.accent : '#EEEEEE',
              }
            ]}
          >
            <Picker
              selectedValue={state}
              onValueChange={(itemValue: string) => {
                setState(itemValue);
                if (errors.state) {
                  setErrors({...errors, state: ''});
                }
              }}
              enabled={isEditing}
              style={[
                styles.picker, 
                { color: Colors.light.text }
              ]}
              dropdownIconColor={Colors.light.text}
            >
              {STATES.map((stateName) => (
                <Picker.Item key={stateName} label={stateName} value={stateName} />
              ))}
            </Picker>
          </View>
          {errors.state ? (
            <Text style={styles.errorText}>{errors.state}</Text>
          ) : null}
        </View>
        
        {isProfileLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.light.accent} />
            <Text style={styles.loadingText}>Updating profile...</Text>
          </View>
        )}
      </View>

      {/* Password Section */}
      <View style={styles.formSection}>
        <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
          Change Password
        </Text>

        {/* Current Password */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors.light.text }]}>Current Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                { 
                  color: Colors.light.text,
                  backgroundColor: Colors.light.secondary,
                  borderColor: errors.currentPassword ? Colors.light.error : '#EEEEEE',
                }
              ]}
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                if (errors.currentPassword) {
                  setErrors({...errors, currentPassword: ''});
                }
              }}
              secureTextEntry={!passwordVisible}
              placeholder="Enter current password"
              placeholderTextColor={Colors.light.tabIconDefault}
            />
            <TouchableOpacity
              style={styles.passwordVisibility}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? 'eye-off' : 'eye'}
                size={22}
                color={Colors.light.tabIconDefault}
              />
            </TouchableOpacity>
          </View>
          {errors.currentPassword ? (
            <Text style={styles.errorText}>{errors.currentPassword}</Text>
          ) : null}
        </View>

        {/* New Password */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors.light.text }]}>New Password</Text>
          <TextInput
            style={[
              styles.input,
              { 
                color: Colors.light.text,
                backgroundColor: Colors.light.secondary,
                borderColor: errors.newPassword ? Colors.light.error : '#EEEEEE',
              }
            ]}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.newPassword) {
                setErrors({...errors, newPassword: ''});
              }
            }}
            secureTextEntry={!passwordVisible}
            placeholder="Enter new password"
            placeholderTextColor={Colors.light.tabIconDefault}
          />
          {errors.newPassword ? (
            <Text style={styles.errorText}>{errors.newPassword}</Text>
          ) : null}
        </View>

        {/* Confirm New Password */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: Colors.light.text }]}>Confirm New Password</Text>
          <TextInput
            style={[
              styles.input,
              { 
                color: Colors.light.text,
                backgroundColor: Colors.light.secondary,
                borderColor: errors.confirmPassword ? Colors.light.error : '#EEEEEE',
              }
            ]}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({...errors, confirmPassword: ''});
              }
            }}
            secureTextEntry={!passwordVisible}
            placeholder="Confirm new password"
            placeholderTextColor={Colors.light.tabIconDefault}
          />
          {errors.confirmPassword ? (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.updatePasswordButton,
            { backgroundColor: Colors.light.accent },
            isPasswordLoading && styles.disabledButton
          ]}
          onPress={handlePasswordChange}
          disabled={isPasswordLoading}
        >
          {isPasswordLoading ? (
            <View style={styles.buttonLoadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.updatePasswordButtonText}>Updating...</Text>
            </View>
          ) : (
            <Text style={styles.updatePasswordButtonText}>
              Update Password
            </Text>
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  loadingText: {
    color: Colors.light.accent,
    marginLeft: 8,
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 