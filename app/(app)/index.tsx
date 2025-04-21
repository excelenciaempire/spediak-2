import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/context/AuthContext';
import { inspectionApi } from '@/services/api';
import { useNavigation } from '@react-navigation/native';
import DrawerButton from '@/components/DrawerButton';
// Note: expo-speech-recognition might not be directly available
// In a real implementation, you would use expo-speech or a similar package
// For this example, we'll mock the interface

// Mock Speech Recognition interface
const Speech = {
  requestPermissionsAsync: async (): Promise<{ status: string }> => {
    return { status: 'granted' };
  },
  startListeningAsync: async ({ onResult, onError }: { 
    onResult: (result: { transcript: string }) => void, 
    onError: (error: any) => void 
  }) => {
    // Mock implementation that would simulate voice-to-text
    setTimeout(() => {
      onResult({ transcript: 'This is a sample transcription.' });
    }, 2000);
  },
  stopListeningAsync: async () => {
    // Mock implementation
  }
};

interface SpeechResult {
  transcript: string;
}

export default function NewInspectionScreen() {
  const colorScheme = useColorScheme() || 'light'; // Provide a default value
  const { user, token } = useAuth();
  const navigation = useNavigation();
  
  // Set up the drawer menu button in the header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <DrawerButton />,
    });
  }, [navigation]);
  
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ddidResponse, setDdidResponse] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Check if either image or description is missing
  const isGenerateDisabled = !image || !description;

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Check file size (approximate calculation, can be refined)
      // const imgInfo = await Image.resolveAssetSource({uri: result.assets[0].uri});
      const fileSize = result.assets[0].fileSize || 0;
      
      // Check if file size is greater than 5MB (5 * 1024 * 1024 bytes)
      if (fileSize > 5 * 1024 * 1024) {
        Alert.alert(
          'File Too Large',
          'Please select an image smaller than 5MB',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const fileSize = result.assets[0].fileSize || 0;
      
      // Check if file size is greater than 5MB
      if (fileSize > 5 * 1024 * 1024) {
        Alert.alert(
          'File Too Large',
          'Image size exceeds 5MB limit. Please try again with a smaller image.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setImage(result.assets[0].uri);
    }
  };

  const startVoiceToText = async () => {
    try {
      const { status } = await Speech.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required for voice-to-text',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsRecording(true);
      await Speech.startListeningAsync({
        onResult: (result: SpeechResult) => {
          setDescription(result.transcript);
        },
        onError: (error: any) => {
          console.log(error);
          setIsRecording(false);
        },
      });
    } catch (error) {
      console.log('Voice recognition error:', error);
      Alert.alert(
        'Error',
        'Unable to start voice recognition. Please type your description instead.',
        [{ text: 'OK' }]
      );
      setIsRecording(false);
    }
  };

  const stopVoiceToText = async () => {
    try {
      await Speech.stopListeningAsync();
    } catch (error) {
      console.log('Error stopping speech recognition:', error);
    }
    setIsRecording(false);
  };

  const handleGenerateDDID = async () => {
    if (isGenerateDisabled || !user || !token) return;

    setIsLoading(true);
    setApiError(null);

    try {
      // In a production app, we would upload the image to a storage service
      // and then pass the URL to the API. For now, we'll use the local URI.
      const imageUrl = image; // This would be replaced with a cloud storage URL in production
      
      // Call the API to generate DDID
      const response = await inspectionApi.generateDDID(
        imageUrl,
        description,
        user.state,
        token
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to generate DDID');
      }
      
      setDdidResponse(response.data.ddidResponse);
      setModalVisible(true);
      
      // After getting a successful DDID, automatically save the inspection
      await saveInspection(response.data.ddidResponse);
    } catch (error: any) {
      console.error('Error generating DDID:', error);
      setApiError(error.message || 'There was a problem generating the DDID response. Please try again.');
      Alert.alert(
        'Error',
        error.message || 'There was a problem generating the DDID response. Please try again.',
        [{ text: 'Try Again' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const saveInspection = async (generatedDdid: string) => {
    if (!user || !token || !image) return;
    
    setIsSaving(true);
    
    try {
      // Save the inspection to the backend
      const response = await inspectionApi.saveInspection(
        user.id,
        image, // This would be replaced with a cloud storage URL in production
        description,
        generatedDdid,
        token
      );
      
      if (!response.success) {
        console.warn('Warning: Inspection saved, but record could not be stored:', response.message);
      }
    } catch (error) {
      console.error('Error saving inspection:', error);
      // We don't show an error to the user here since the DDID was generated successfully
      // The user can still view and copy the DDID
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewInspection = () => {
    if (image || description) {
      Alert.alert(
        'Clear Current Inspection?',
        'This will clear your current image and description. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Clear',
            onPress: () => {
              setImage(null);
              setDescription('');
              setDdidResponse(null);
              setApiError(null);
            },
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const copyToClipboard = async () => {
    if (!ddidResponse) return;
    
    try {
      await Clipboard.setStringAsync(ddidResponse);
      Alert.alert('Success', 'DDID response copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
    
    setModalVisible(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].background }]}>
      <View style={styles.content}>
        {/* Image Upload Area */}
        <TouchableOpacity
          style={[styles.imageUploadArea, !image && styles.imageUploadAreaEmpty]}
          onPress={() => {
            Alert.alert(
              'Upload Image', 
              'Choose an option', 
              [
                {text: 'Take Photo', onPress: takePhoto},
                {text: 'Choose from Gallery', onPress: pickImage},
                {text: 'Cancel', style: 'cancel'}
              ]
            );
          }}
          disabled={isLoading || isSaving}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="camera" size={40} color={Colors[colorScheme as 'light' | 'dark'].icon} />
              <Text style={[styles.uploadText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
                Tap to upload or take a photo
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              { 
                color: Colors[colorScheme as 'light' | 'dark'].text,
                backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary,
                borderColor: Colors[colorScheme as 'light' | 'dark'].icon,
              }
            ]}
            placeholder="Describe the issue..."
            placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!isLoading && !isSaving}
          />
          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording && { backgroundColor: Colors[colorScheme as 'light' | 'dark'].error }
            ]}
            onPress={isRecording ? stopVoiceToText : startVoiceToText}
            disabled={isLoading || isSaving}
          >
            <Ionicons 
              name={isRecording ? "mic" : "mic-outline"} 
              size={24} 
              color={Colors[colorScheme as 'light' | 'dark'].secondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Error Message (if any) */}
        {apiError && (
          <Text style={[styles.errorText, { color: Colors[colorScheme as 'light' | 'dark'].error }]}>
            {apiError}
          </Text>
        )}

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            isGenerateDisabled && styles.disabledButton,
            { backgroundColor: isGenerateDisabled ? '#cccccc' : Colors[colorScheme as 'light' | 'dark'].accent }
          ]}
          onPress={handleGenerateDDID}
          disabled={isGenerateDisabled || isLoading || isSaving}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors[colorScheme as 'light' | 'dark'].secondary} />
          ) : (
            <Text style={styles.generateButtonText}>Generate DDID Response</Text>
          )}
        </TouchableOpacity>

        {/* New Inspection Button */}
        <TouchableOpacity
          style={[
            styles.newInspectionButton,
            { borderColor: Colors[colorScheme as 'light' | 'dark'].accent }
          ]}
          onPress={handleNewInspection}
          disabled={isLoading || isSaving}
        >
          <Text style={[styles.newInspectionButtonText, { color: Colors[colorScheme as 'light' | 'dark'].accent }]}>
            New Inspection
          </Text>
        </TouchableOpacity>
      </View>

      {/* DDID Response Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors[colorScheme as 'light' | 'dark'].text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>DDID Response</Text>
              <TouchableOpacity onPress={copyToClipboard}>
                <Ionicons name="copy-outline" size={24} color={Colors[colorScheme as 'light' | 'dark'].accent} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.ddidText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
                {ddidResponse}
              </Text>
              {isSaving && (
                <View style={styles.savingContainer}>
                  <ActivityIndicator color={Colors[colorScheme as 'light' | 'dark'].accent} size="small" />
                  <Text style={[styles.savingText, { color: Colors[colorScheme as 'light' | 'dark'].tabIconDefault }]}>
                    Saving inspection...
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  imageUploadArea: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageUploadAreaEmpty: {
    borderWidth: 2,
    borderColor: '#cccccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 24,
  },
  textInput: {
    width: '100%',
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    paddingRight: 50,
    textAlignVertical: 'top',
  },
  micButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: '#0A2540',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  generateButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  newInspectionButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  newInspectionButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    maxHeight: '90%',
  },
  ddidText: {
    fontSize: 16,
    lineHeight: 24,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
  },
  savingText: {
    marginLeft: 10,
    fontSize: 14,
  },
}); 