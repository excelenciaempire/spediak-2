import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
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
  profileImageUrl: null, // Default is null, can be a URL
};

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
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(MOCK_USER.profileImageUrl);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Set up the drawer menu button in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <DrawerButton />,
    });
  }, [navigation]);

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
          <TouchableOpacity onPress={toggleEdit}>
            <Text style={[styles.editButton, { color: Colors.light.accent }]}>
              {isEditing ? 'Save' : 'Edit'}
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
                borderColor: isEditing ? Colors.light.accent : '#EEEEEE',
              }
            ]}
            value={fullName}
            onChangeText={setFullName}
            editable={isEditing}
          />
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
                borderColor: isEditing ? Colors.light.accent : '#EEEEEE',
              }
            ]}
          >
            <Picker
              selectedValue={state}
              onValueChange={(itemValue: string) => setState(itemValue)}
              enabled={isEditing}
              style={[
                styles.picker, 
                { color: Colors.light.text }
              ]}
              dropdownIconColor={Colors.light.text}
            >
              <Picker.Item label="North Carolina" value="North Carolina" />
              <Picker.Item label="South Carolina" value="South Carolina" />
            </Picker>
          </View>
        </View>
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
                  borderColor: '#EEEEEE',
                }
              ]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
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
                borderColor: '#EEEEEE',
              }
            ]}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!passwordVisible}
            placeholder="Enter new password"
            placeholderTextColor={Colors.light.tabIconDefault}
          />
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
                borderColor: '#EEEEEE',
              }
            ]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!passwordVisible}
            placeholder="Confirm new password"
            placeholderTextColor={Colors.light.tabIconDefault}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.updatePasswordButton,
            { backgroundColor: Colors.light.accent }
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 