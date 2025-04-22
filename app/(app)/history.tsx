import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Modal, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator,
  TextInput,
  Animated,
  Easing,
  Dimensions,
  ToastAndroid,
  Platform,
  Alert
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DrawerButton from '@/components/DrawerButton';
import { useAuth } from '@/context/AuthContext';
import { inspectionApi, Inspection } from '@/services/api';
import * as Clipboard from 'expo-clipboard';
import { storageService, UserPreferences } from '@/services/storage';
import NetInfo from '@react-native-community/netinfo';

export default function InspectionHistoryScreen() {
  // Will always return 'light'
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { user, token } = useAuth();
  
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isOffline, setIsOffline] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Start animations when the component mounts
  useLayoutEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();
    
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!(state.isConnected && state.isInternetReachable));
    });
    
    // Load user preferences
    loadUserPreferences();
    
    return () => {
      unsubscribe();
    };
  }, [fadeAnim, slideAnim]);

  // Set up the drawer menu button in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <DrawerButton />,
    });
  }, [navigation]);
  
  const loadUserPreferences = async () => {
    if (!user?.id) return;
    
    try {
      const prefs = await storageService.getUserPreferences(user.id);
      setSortOrder(prefs.sortOrder);
      
      // Load last sync time
      const lastSyncTime = await storageService.getLastSyncTimestamp(user.id);
      if (lastSyncTime) {
        const date = new Date(lastSyncTime);
        setLastSync(date.toLocaleString());
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };
  
  const saveUserPreferences = async () => {
    if (!user?.id) return;
    
    try {
      await storageService.saveUserPreferences(user.id, {
        sortOrder,
      });
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  const fetchInspections = useCallback(async () => {
    if (!user?.id || !token) return;
    
    try {
      setError(null);
      const response = await inspectionApi.getInspections(user.id, token);
      
      // Check if loaded from local storage
      if (response.message?.includes('local storage')) {
        showToast('Loaded from local storage');
        setIsOffline(true);
      } else {
        setIsOffline(false);
        // Update last sync time
        const lastSyncTime = await storageService.getLastSyncTimestamp(user.id);
        if (lastSyncTime) {
          const date = new Date(lastSyncTime);
          setLastSync(date.toLocaleString());
        }
      }
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch inspection history');
      }
      
      // Sort the inspections based on the current sort order
      const sortedInspections = sortInspections(response.data.inspections, sortOrder);
      setInspections(sortedInspections);
      setFilteredInspections(sortedInspections);
    } catch (error: any) {
      console.error('Error fetching inspections:', error);
      setError(error.message || 'Unable to load inspection history. Please try again.');
      
      // Try to load from local storage as fallback
      try {
        if (user?.id) {
          const localInspections = await storageService.getInspections(user.id);
          if (localInspections.length > 0) {
            const sortedInspections = sortInspections(localInspections, sortOrder);
            setInspections(sortedInspections);
            setFilteredInspections(sortedInspections);
            showToast('Loaded from local storage');
            setError(null);
            setIsOffline(true);
          }
        }
      } catch (storageError) {
        console.error('Error loading from local storage:', storageError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, token, sortOrder]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);
  
  // Filter inspections when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredInspections(inspections);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = inspections.filter(
        inspection => 
          inspection.description.toLowerCase().includes(lowercaseQuery) ||
          inspection.ddid_response.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredInspections(filtered);
    }
  }, [searchQuery, inspections]);
  
  // Save preferences when sort order changes
  useEffect(() => {
    saveUserPreferences();
  }, [sortOrder]);
  
  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // On iOS, we could use a custom toast or Alert
      console.log(message);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInspections();
  }, [fetchInspections]);
  
  const sortInspections = (inspectionsList: Inspection[], order: 'newest' | 'oldest') => {
    return [...inspectionsList].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };
  
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
    setSortOrder(newOrder);
    setFilteredInspections(sortInspections(filteredInspections, newOrder));
  };

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
    if (selectedInspection?.ddid_response) {
      try {
        await Clipboard.setStringAsync(selectedInspection.ddid_response);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const syncNow = async () => {
    if (!user?.id || !token) return;
    
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert('Offline', 'You need an internet connection to sync data.');
      return;
    }
    
    setRefreshing(true);
    try {
      // This will process the offline queue
      await inspectionApi.getInspections(user.id, token);
      showToast('Synced successfully');
      
      // Update last sync time display
      const lastSyncTime = await storageService.getLastSyncTimestamp(user.id);
      if (lastSyncTime) {
        const date = new Date(lastSyncTime);
        setLastSync(date.toLocaleString());
      }
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Failed', 'There was an error syncing your data. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  const renderInspectionItem = ({ item, index }: { item: Inspection, index: number }) => {
    // Staggered animation for list items
    const itemFadeAnim = useRef(new Animated.Value(0)).current;
    const itemSlideAnim = useRef(new Animated.Value(50)).current;
    
    useEffect(() => {
      const delay = index * 100; // Stagger the animations
      Animated.parallel([
        Animated.timing(itemFadeAnim, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        }),
        Animated.timing(itemSlideAnim, {
          toValue: 0,
          duration: 500,
          delay,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        })
      ]).start();
    }, []);
  
    return (
      <Animated.View
        style={{
          opacity: itemFadeAnim,
          transform: [{ translateY: itemSlideAnim }]
        }}
      >
        <TouchableOpacity
          style={[
            styles.inspectionItem,
            { backgroundColor: Colors.light.secondary }
          ]}
          onPress={() => openInspectionDetails(item)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: item.image_url }} style={styles.thumbnailImage} />
          <View style={styles.inspectionInfo}>
            <Text style={[styles.descriptionText, { color: Colors.light.text }]}>
              {truncateText(item.description, 70)}
            </Text>
            <Text style={[styles.ddidSnippet, { color: Colors.light.text }]}>
              {truncateText(item.ddid_response, 100)}
            </Text>
            <Text style={[styles.dateText, { color: Colors.light.tabIconDefault }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.light.tabIconDefault}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: Colors.light.background }]}>
        <ActivityIndicator size="large" color={Colors.light.accent} />
        <Text style={[styles.loadingText, { color: Colors.light.text }]}>Loading inspection history...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={16} color="#FFF" />
          <Text style={styles.offlineBannerText}>Offline Mode</Text>
          <TouchableOpacity onPress={syncNow} style={styles.syncButton}>
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.light.tabIconDefault} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inspections..."
            placeholderTextColor={Colors.light.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
              <Ionicons name="close-circle" size={20} color={Colors.light.tabIconDefault} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.sortButton} 
          onPress={toggleSortOrder}
        >
          <Ionicons 
            name={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'} 
            size={20} 
            color={Colors.light.text} 
          />
          <Text style={styles.sortButtonText}>
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      {lastSync && (
        <Text style={styles.lastSyncText}>
          Last synced: {lastSync}
        </Text>
      )}
      
      {error && (
        <Animated.View
          style={[
            styles.errorContainer,
            {
              opacity: fadeAnim
            }
          ]}
        >
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}

      {filteredInspections.length === 0 && !error ? (
        <Animated.View
          style={[
            styles.emptyContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Ionicons
            name="document-text-outline"
            size={50}
            color={Colors.light.tabIconDefault}
          />
          <Text style={[styles.emptyText, { color: Colors.light.text }]}>
            {searchQuery.length > 0 
              ? 'No inspections match your search' 
              : 'No inspection history yet'}
          </Text>
          <Text style={[styles.emptySubtext, { color: Colors.light.tabIconDefault }]}>
            {searchQuery.length > 0 
              ? 'Try a different search term' 
              : 'Your completed inspections will appear here'}
          </Text>
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearSearchButtonLarge}
              onPress={clearSearch}
            >
              <Text style={styles.clearSearchButtonText}>Clear Search</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      ) : (
        <FlatList
          data={filteredInspections}
          renderItem={renderInspectionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.accent]}
              tintColor={Colors.light.accent}
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
          <View style={[styles.modalContent, { backgroundColor: Colors.light.secondary }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: Colors.light.text }]}>
                Inspection Details
              </Text>
              <TouchableOpacity onPress={copyToClipboard}>
                <Ionicons 
                  name={copiedToClipboard ? "checkmark-circle" : "copy-outline"} 
                  size={24} 
                  color={copiedToClipboard ? "green" : Colors.light.accent} 
                />
              </TouchableOpacity>
            </View>

            {selectedInspection && (
              <ScrollView style={styles.modalBody}>
                <Image
                  source={{ uri: selectedInspection.image_url }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <View style={styles.modalInfoSection}>
                  <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                    Description
                  </Text>
                  <Text style={[styles.sectionContent, { color: Colors.light.text }]}>
                    {selectedInspection.description}
                  </Text>
                </View>
                <View style={styles.modalInfoSection}>
                  <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                    DDID Response
                  </Text>
                  <Text style={[styles.sectionContent, { color: Colors.light.text }]}>
                    {selectedInspection.ddid_response}
                  </Text>
                </View>
                <View style={styles.modalInfoSection}>
                  <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                    Date Created
                  </Text>
                  <Text style={[styles.sectionContent, { color: Colors.light.text }]}>
                    {formatDate(selectedInspection.created_at)}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#FFEDEE',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
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
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  inspectionItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  thumbnailImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  inspectionInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ddidSnippet: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  dateText: {
    fontSize: 11,
  },
  chevronIcon: {
    alignSelf: 'center',
    marginLeft: 8,
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
    maxHeight: '90%',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalInfoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.light.text,
    fontSize: 14,
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchButtonLarge: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.accent,
    borderRadius: 20,
  },
  clearSearchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortButtonText: {
    marginLeft: 4,
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: '500',
  },
  offlineBanner: {
    backgroundColor: '#F57C00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offlineBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastSyncText: {
    fontSize: 11,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    paddingBottom: 8,
  },
}); 