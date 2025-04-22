import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ActivityIndicator, 
  Modal, 
  ScrollView, 
  Alert,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import DrawerButton from '@/components/DrawerButton';
import { useAuth } from '@/context/AuthContext';
import { inspectionApi } from '@/services/api';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/services/supabaseClient';
import * as FileSystem from 'expo-file-system';
import { ImagePickerAsset } from 'expo-image-picker';
// Note: expo-speech-recognition might not be directly available
// In a real implementation, you would use expo-speech or a similar package
// For this example, we'll mock the interface
// import * as Speech from 'expo-speech-recognition';

// Mock Speech Recognition interface
const Speech = {
  requestPermissionsAsync: async (): Promise<{ status: string }> => {
    // Simulate asking for mic permission
    console.log("Requesting mic permission...");
    return { status: 'granted' };
  },
  startListeningAsync: async ({ onResult, onError }: { 
    onResult: (result: { transcript: string }) => void, 
    onError: (error: any) => void 
  }) => {
    console.log("Starting mock speech recognition...");
    setTimeout(() => {
        const transcripts = [
            "Replace the damaged front bumper cover.",
            "Minor scratch on the driver side door, recommend buffing.",
            "Rear taillight assembly needs replacement, lens is cracked.",
            "Significant dent on the passenger side rear quarter panel.",
            "Windshield has a chip, suggest resin injection repair."
        ];
        const randomTranscript = transcripts[Math.floor(Math.random() * transcripts.length)];
        console.log("Mock speech result:", randomTranscript);
        onResult({ transcript: randomTranscript });
    }, 2500); // Simulate listening time
  },
  stopListeningAsync: async () => {
    console.log("Stopping mock speech recognition...");
    // Mock implementation
  }
};

interface SpeechResult {
  transcript: string;
}

export default function NewInspectionScreen() {
  const colorScheme = useColorScheme() || 'light';
  const navigation = useNavigation();
  const { authUser, user } = useAuth();
  
  // Set up the drawer menu button in the header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <DrawerButton />,
    });
  }, [navigation]);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Start animations when the component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();
  }, [fadeAnim, slideAnim]);
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ddidResponse, setDdidResponse] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Generate button disabled if no *uploaded* image URL or no description, or during generation/upload
  const isGenerateDisabled = !uploadedImageUrl || !description || isGenerating || isUploading;

  // Function to upload image to Supabase Storage
  const uploadImage = async (asset: ImagePickerAsset): Promise<string | null> => {
    if (!authUser?.id) {
      setUploadError('User not logged in.');
      return null;
    }
    setIsUploading(true);
    setUploadError(null);
    setUploadedImageUrl(null);

    try {
      // Still use URI to determine extension and filename
      const uri = asset.uri;
      const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      const fileName = `${Date.now()}.${fileExtension}`;
      const filePath = `${authUser.id}/${fileName}`;
      const BUCKET_NAME = 'inspection_images';

      let blob: Blob;

      // Platform-specific handling to get the Blob
      if (Platform.OS === 'web') {
        // On web, fetch the blob URI to get the Blob object
        // This might still face issues depending on browser security
        console.log("Attempting to fetch web asset URI:", uri);
        const response = await fetch(uri);
        if (!response.ok) {
          console.error("Fetch failed for web URI:", uri, "Status:", response.status, "Status text:", response.statusText);
          // Try to provide a more specific error message if possible
          let errorMessage = `Failed to fetch web image file. Status: ${response.status}`;
          if (response.status === 0) { // Often indicates a CORS or network error
             errorMessage += ' (Network error or CORS issue likely)';
          }
          throw new Error(errorMessage);
        }
        blob = await response.blob();
        console.log("Web fetch successful, got blob:", blob);
      } else {
        // Native platform: fetch the file URI (this worked previously)
        const response = await fetch(uri);
        if (!response.ok) throw new Error('Failed to fetch local image file.');
        blob = await response.blob();
      }

      console.log(`Uploading blob (Size: ${blob.size}, Type: ${blob.type}) to path: ${filePath}`);

      // Upload the blob to Supabase
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, blob, { contentType, upsert: false });

      if (uploadError) {
        // Log the detailed Supabase error
        console.error('Supabase upload error details:', uploadError);
        throw new Error(`Supabase upload error: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) {
        throw new Error('Upload successful, but could not get public URL. Check bucket permissions.');
      }

      console.log('Upload successful. Public URL:', publicUrl);
      setUploadedImageUrl(publicUrl);
      return publicUrl;

    } catch (error: any) {
      console.error('Error in uploadImage function:', error); // Log the caught error
      setUploadError(`Upload failed: ${error.message}`);
      // Don't clear the preview URI on failure
      // setImageUri(null);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileSize = asset.fileSize || 0;
        
        if (fileSize > 5 * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            'Please select an image smaller than 5MB',
            [{ text: 'OK' }]
          );
          return;
        }
        
        setApiError(null);
        setUploadError(null);
        setImageUri(asset.uri); // Set preview
        await uploadImage(asset); // Pass the full asset object
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required','Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Slightly reduce quality
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
         // NOTE: Camera photos might not have reliable fileSize on all platforms/versions
         // Consider adding checks after upload if needed, or rely on storage limits.
         // Fix: Declare fileSize before using it
         const fileSize = asset.fileSize || 0;
        setApiError(null); // Clear previous API errors
        setUploadError(null); // Clear previous upload errors
        // Check size (e.g., 5MB limit)
        if (fileSize > 5 * 1024 * 1024) {
           Alert.alert('File Too Large','Image size exceeds 5MB limit. Please try again.');
           return;
        }
        setImageUri(asset.uri); // Set local URI for preview
        await uploadImage(asset); // Start upload
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
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
      setApiError(null);
      await Speech.startListeningAsync({
        onResult: (result: SpeechResult) => {
          setDescription(prev => prev ? `${prev} ${result.transcript}` : result.transcript);
        },
        onError: (error: any) => {
          console.log('Speech recognition error:', error);
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
    if (!uploadedImageUrl) {
      if (isUploading) {
        setApiError('Please wait for the image to finish uploading.');
      } else if (uploadError) {
        setApiError(`Image upload failed: ${uploadError}. Please select image again.`);
      } else if (!imageUri) {
         setApiError('Please select an image first.');
      } else {
         setApiError('Image is not ready for generation. Try selecting again.');
      }
      return;
    }

    if (!description) {
      setApiError('Please provide a description');
      return;
    }

    if (!authUser) {
      setApiError('You must be logged in to generate a DDID report');
      return;
    }

    setApiError(null);
    setIsGenerating(true);
    
    try {
      const response = await inspectionApi.generateDDID(
        uploadedImageUrl!,
        description,
        authUser!.id
      );
      
      if (!response.data?.ddidResponse) {
        throw new Error(response.message || 'Failed to generate DDID: No response data');
      }
      
      setDdidResponse(response.data.ddidResponse);
      setModalVisible(true);
    } catch (error: any) {
      console.error('Error generating DDID:', error);
      setApiError(error.message || 'An error occurred while generating the DDID report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveInspection = async () => {
    if (!ddidResponse || !uploadedImageUrl || !description || !authUser?.id) {
      setApiError('Missing required information to save inspection (Ensure image uploaded and DDID generated)');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setApiError(null);
    
    try {
      const response = await inspectionApi.saveInspection(
        authUser!.id,
        uploadedImageUrl!,
        description,
        ddidResponse!
      );
      
      if (!response.data?.inspection) {
        throw new Error(response.message || 'Failed to save inspection: No response data');
      }
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        setModalVisible(false);
        setImageUri(null);
        setUploadedImageUrl(null);
        setDescription('');
        setDdidResponse(null);
        setSaveSuccess(false);
      }, 1500);
    } catch (error: any) {
      console.error('Error saving inspection:', error);
      setApiError(error.message || 'An error occurred while saving the inspection');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewInspection = () => {
    if (imageUri || description) { 
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
              setImageUri(null);
              setUploadedImageUrl(null);
              setDescription('');
              setDdidResponse(null);
              setApiError(null);
              setUploadError(null);
            },
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const copyToClipboard = async () => {
    if (ddidResponse) {
      try {
        await Clipboard.setStringAsync(ddidResponse);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        Alert.alert('Error', 'Failed to copy to clipboard');
      }
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* API Error message */}
        {apiError && (
          <View style={[styles.errorContainer, { borderLeftColor: Colors.light.danger }]}>
            <Text style={[styles.errorText, { color: Colors.light.danger }]}>{apiError}</Text>
          </View>
        )}
        {/* Upload Error message */}
        {uploadError && (
           <View style={[styles.errorContainer, { borderLeftColor: Colors.light.warning, backgroundColor: '#FFF8E1' }]}>
             <Text style={[styles.errorText, { color: Colors.light.warning }]}>{uploadError}</Text>
           </View>
        )}

        {/* Image Upload Area */}
        <TouchableOpacity
          style={[
              styles.imageUploadArea, 
              !imageUri && styles.imageUploadAreaEmpty,
              uploadError && styles.uploadAreaError
          ]}
          onPress={() => {
            if (Platform.OS === 'web') {
              // On web, directly trigger file picker
              pickImage(); 
            } else {
              // On native, show options alert
              Alert.alert(
                'Upload Image', 
                'Choose an option', 
                [
                  {text: 'Take Photo', onPress: takePhoto},
                  {text: 'Choose from Gallery', onPress: pickImage},
                  {text: 'Cancel', style: 'cancel'}
                ]
              );
            }
          }}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="camera" size={40} color={Colors.light.icon} />
              <Text style={[styles.uploadText, { color: Colors.light.text }]}>
                Tap to upload or take a photo
              </Text>
            </View>
          )}
          {/* Uploading Indicator */}
           {isUploading && (
             <View style={styles.uploadingOverlay}>
               <ActivityIndicator size="large" color={Colors.light.primary} />
               <Text style={styles.uploadingText}>Uploading...</Text>
             </View>
           )}
        </TouchableOpacity>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              { 
                color: Colors.light.text,
                backgroundColor: Colors.light.secondary,
                borderColor: Colors.light.icon,
              }
            ]}
            placeholder="Describe the issue..."
            placeholderTextColor={Colors.light.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording && { backgroundColor: Colors.light.danger }
            ]}
            onPress={isRecording ? stopVoiceToText : startVoiceToText}
          >
            <Ionicons 
              name={isRecording ? "mic" : "mic-outline"} 
              size={24} 
              color={Colors.light.background}
            />
          </TouchableOpacity>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            isGenerateDisabled && styles.disabledButton,
            { backgroundColor: isGenerateDisabled ? Colors.light.grey : Colors.light.primary }
          ]}
          onPress={handleGenerateDDID}
          disabled={isGenerateDisabled || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={Colors.light.background} />
          ) : (
            <Text style={styles.generateButtonText}>Generate DDID Response</Text>
          )}
        </TouchableOpacity>

        {/* New Inspection Button */}
        <TouchableOpacity
          style={[
            styles.newInspectionButton,
            { borderColor: Colors.light.primary }
          ]}
          onPress={handleNewInspection}
        >
          <Text style={[styles.newInspectionButtonText, { color: Colors.light.primary }]}> 
            New Inspection
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* DDID Response Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors.light.secondary }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: Colors.light.text }]}>
                DDID Response
              </Text>
              <TouchableOpacity onPress={copyToClipboard}>
                <Ionicons 
                  name={copiedToClipboard ? "checkmark-circle" : "copy-outline"} 
                  size={24} 
                  color={copiedToClipboard ? "green" : Colors.light.accent} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.ddidResponseText, { color: Colors.light.text }]}>
                {ddidResponse}
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              {saveSuccess ? (
                <View style={styles.saveSuccessContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="green" />
                  <Text style={styles.saveSuccessText}>Inspection saved successfully!</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: Colors.light.accent },
                    isSaving && styles.disabledButton
                  ]}
                  onPress={handleSaveInspection}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Inspection</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
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
  errorContainer: {
    backgroundColor: '#FFEDEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    borderLeftWidth: 4,
  },
  errorText: {
    fontSize: 14,
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
    borderColor: '#EEEEEE',
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
    backgroundColor: Colors.light.primary,
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
    color: Colors.light.background,
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
    maxHeight: '90%',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    maxHeight: '70%',
  },
  ddidResponseText: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  saveButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: Colors.light.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveSuccessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  saveSuccessText: {
    color: 'green',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  uploadAreaError: {
    borderColor: Colors.light.danger,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 8,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
}); 