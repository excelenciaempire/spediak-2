import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// Note: expo-speech-recognition might not be directly available
// In a real implementation, you would use expo-speech or a similar package
// For this example, we'll mock the interface
// import * as Speech from 'expo-speech-recognition';

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
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ddidResponse, setDdidResponse] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    if (isGenerateDisabled) return;

    setIsLoading(true);

    try {
      // In a real app, this would make an API call to the backend
      // For demonstration, we'll simulate an API call
      setTimeout(() => {
        const mockResponse = `DDID Statement: The inspector observed water damage on the ceiling below the upstairs bathroom. This is a defect because it indicates a water leak from the plumbing or the shower/tub enclosure above. The moisture can lead to structural damage, mold growth, and deterioration of building materials if not addressed. 

The inspector recommends having a licensed plumber evaluate the source of the leak and make necessary repairs. Additionally, once the leak is fixed, the affected ceiling material should be replaced or repaired by a qualified contractor.`;
        
        setDdidResponse(mockResponse);
        setIsLoading(false);
        setModalVisible(true);
      }, 2000);
    } catch (error) {
      console.error('Error generating DDID:', error);
      setIsLoading(false);
      Alert.alert(
        'Error',
        'There was a problem generating the DDID response. Please check your connection and try again.',
        [{ text: 'Try Again' }]
      );
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
            },
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const copyToClipboard = () => {
    // In a real app, this would use Clipboard.setStringAsync(ddidResponse)
    Alert.alert('Copied', 'DDID response copied to clipboard');
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
          />
          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording && { backgroundColor: Colors[colorScheme as 'light' | 'dark'].error }
            ]}
            onPress={isRecording ? stopVoiceToText : startVoiceToText}
          >
            <Ionicons 
              name={isRecording ? "mic" : "mic-outline"} 
              size={24} 
              color={Colors[colorScheme as 'light' | 'dark'].secondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            isGenerateDisabled && styles.disabledButton,
            { backgroundColor: isGenerateDisabled ? '#cccccc' : Colors[colorScheme as 'light' | 'dark'].accent }
          ]}
          onPress={handleGenerateDDID}
          disabled={isGenerateDisabled || isLoading}
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
}); 