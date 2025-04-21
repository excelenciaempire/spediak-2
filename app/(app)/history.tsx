import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/context/AuthContext';
import { inspectionApi, Inspection } from '@/services/api';
import { useNavigation } from '@react-navigation/native';
import DrawerButton from '@/components/DrawerButton';

export default function InspectionHistoryScreen() {
  const colorScheme = useColorScheme() || 'light';
  const { user, token } = useAuth();
  const navigation = useNavigation();
  
  // Set up the drawer menu button in the header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <DrawerButton />,
    });
  }, [navigation]);
  
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch inspections
  const fetchInspections = useCallback(async () => {
    if (!user || !token) return;
    
    try {
      setError(null);
      const response = await inspectionApi.getInspections(user.id, token);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch inspections');
      }
      
      setInspections(response.data.inspections || []);
    } catch (error: any) {
      console.error('Error fetching inspections:', error);
      setError(error.message || 'Failed to load inspection history. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, token]);

  // Fetch inspections when the component mounts
  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchInspections();
  }, [fetchInspections]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const openInspectionDetails = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setModalVisible(true);
  };

  const copyToClipboard = async () => {
    if (!selectedInspection) return;
    
    try {
      await Clipboard.setStringAsync(selectedInspection.ddidResponse);
      alert('DDID response copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const renderInspectionItem = ({ item }: { item: Inspection }) => (
    <TouchableOpacity
      style={[
        styles.inspectionItem,
        { backgroundColor: Colors[colorScheme as 'light' | 'dark'].secondary }
      ]}
      onPress={() => openInspectionDetails(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} />
      <View style={styles.inspectionInfo}>
        <Text style={[styles.descriptionText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
          {truncateText(item.description, 70)}
        </Text>
        <Text style={[styles.ddidSnippet, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
          {truncateText(item.ddidResponse, 100)}
        </Text>
        <Text style={[styles.dateText, { color: Colors[colorScheme as 'light' | 'dark'].tabIconDefault }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
        style={styles.chevronIcon}
      />
    </TouchableOpacity>
  );

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme as 'light' | 'dark'].accent} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
          Loading inspections...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].background }]}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors[colorScheme as 'light' | 'dark'].error }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].accent }]}
            onPress={fetchInspections}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && inspections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-text-outline"
            size={50}
            color={Colors[colorScheme as 'light' | 'dark'].tabIconDefault}
          />
          <Text style={[styles.emptyText, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
            No inspection history yet
          </Text>
          <Text style={[styles.emptySubtext, { color: Colors[colorScheme as 'light' | 'dark'].tabIconDefault }]}>
            Your completed inspections will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={inspections}
          renderItem={renderInspectionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[Colors[colorScheme as 'light' | 'dark'].accent]}
              tintColor={Colors[colorScheme as 'light' | 'dark'].accent}
            />
          }
        />
      )}

      {/* Inspection Details Modal */}
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
              <Text style={[styles.modalTitle, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
                Inspection Details
              </Text>
              <TouchableOpacity onPress={copyToClipboard}>
                <Ionicons name="copy-outline" size={24} color={Colors[colorScheme as 'light' | 'dark'].accent} />
              </TouchableOpacity>
            </View>

            {selectedInspection && (
              <ScrollView style={styles.modalBody}>
                <Image
                  source={{ uri: selectedInspection.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <View style={styles.modalInfoSection}>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
                    Description
                  </Text>
                  <Text style={[styles.sectionContent, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
                    {selectedInspection.description}
                  </Text>
                </View>
                <View style={styles.modalInfoSection}>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
                    DDID Response
                  </Text>
                  <Text style={[styles.sectionContent, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
                    {selectedInspection.ddidResponse}
                  </Text>
                </View>
                <View style={styles.modalInfoSection}>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
                    Date Created
                  </Text>
                  <Text style={[styles.sectionContent, { color: Colors[colorScheme as 'light' | 'dark'].text }]}>
                    {formatDate(selectedInspection.createdAt)}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  inspectionItem: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  thumbnailImage: {
    width: 100,
    height: 100,
  },
  inspectionInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  ddidSnippet: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
  },
  chevronIcon: {
    alignSelf: 'center',
    marginRight: 10,
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
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalInfoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
}); 