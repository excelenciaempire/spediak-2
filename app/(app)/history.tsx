import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DrawerButton from '@/components/DrawerButton';

// Mock data for inspection history
const MOCK_INSPECTIONS = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=400&q=80',
    description: 'Water damage on ceiling below the upstairs bathroom',
    ddidResponse: 'DDID Statement: The inspector observed water damage on the ceiling below the upstairs bathroom. This is a defect because it indicates a water leak from the plumbing or the shower/tub enclosure above. The moisture can lead to structural damage, mold growth, and deterioration of building materials if not addressed.\n\nThe inspector recommends having a licensed plumber evaluate the source of the leak and make necessary repairs. Additionally, once the leak is fixed, the affected ceiling material should be replaced or repaired by a qualified contractor.',
    createdAt: '2023-07-15T14:30:00Z',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=400&q=80',
    description: 'Cracked foundation on southeast corner of the house',
    ddidResponse: 'DDID Statement: The inspector observed a significant crack in the foundation on the southeast corner of the house. This is a defect because foundation cracks can compromise the structural integrity of the home, lead to water intrusion, and potentially indicate ongoing foundation settlement issues.\n\nThe inspector recommends hiring a licensed structural engineer to evaluate the severity of the crack and determine the cause. Based on the findings, appropriate repairs may include epoxy injection, foundation reinforcement, or addressing drainage issues around the perimeter of the home.',
    createdAt: '2023-07-10T09:15:00Z',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=400&q=80',
    description: 'Outdated electrical panel with fuse system',
    ddidResponse: 'DDID Statement: The inspector observed an outdated electrical panel using a fuse system rather than modern circuit breakers. This is a defect because fuse panels are generally considered obsolete by current standards, may not provide adequate capacity for modern electrical demands, and can represent increased fire risks due to potential for improper fuse replacements.\n\nThe inspector recommends consulting with a licensed electrician to evaluate the panel and advise on replacement with a modern circuit breaker panel that meets current electrical code requirements and the electrical demands of the home.',
    createdAt: '2023-06-28T11:45:00Z',
  },
];

interface Inspection {
  id: string;
  imageUrl: string;
  description: string;
  ddidResponse: string;
  createdAt: string;
}

export default function InspectionHistoryScreen() {
  // Will always return 'light'
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Set up the drawer menu button in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <DrawerButton />,
    });
  }, [navigation]);

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

  const copyToClipboard = () => {
    // In a real app, this would use Clipboard.setStringAsync(selectedInspection.ddidResponse)
    alert('DDID response copied to clipboard');
  };

  const renderInspectionItem = ({ item }: { item: Inspection }) => (
    <TouchableOpacity
      style={[
        styles.inspectionItem,
        { backgroundColor: Colors.light.secondary }
      ]}
      onPress={() => openInspectionDetails(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} />
      <View style={styles.inspectionInfo}>
        <Text style={[styles.descriptionText, { color: Colors.light.text }]}>
          {truncateText(item.description, 70)}
        </Text>
        <Text style={[styles.ddidSnippet, { color: Colors.light.text }]}>
          {truncateText(item.ddidResponse, 100)}
        </Text>
        <Text style={[styles.dateText, { color: Colors.light.tabIconDefault }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={Colors.light.tabIconDefault}
        style={styles.chevronIcon}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      {MOCK_INSPECTIONS.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-text-outline"
            size={50}
            color={Colors.light.tabIconDefault}
          />
          <Text style={[styles.emptyText, { color: Colors.light.text }]}>
            No inspection history yet
          </Text>
          <Text style={[styles.emptySubtext, { color: Colors.light.tabIconDefault }]}>
            Your completed inspections will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={MOCK_INSPECTIONS}
          renderItem={renderInspectionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
                <Ionicons name="copy-outline" size={24} color={Colors.light.accent} />
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
                    {selectedInspection.ddidResponse}
                  </Text>
                </View>
                <View style={styles.modalInfoSection}>
                  <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                    Date Created
                  </Text>
                  <Text style={[styles.sectionContent, { color: Colors.light.text }]}>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
}); 