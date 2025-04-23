import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function AppLayout() {
  // useColorScheme will always return 'light'
  const drawerTheme = Colors.light;
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  // Custom drawer content component
  function CustomDrawerContent(props: any) {
    const navigation = useNavigation();
    
    return (
      <DrawerContentScrollView 
        {...props}
        contentContainerStyle={{ flex: 1 }}
        style={{ 
          backgroundColor: drawerTheme.background,
        }}
      >
        {/* Header with logo/user info */}
        <View style={[styles.drawerHeader, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
          <Text style={[styles.drawerTitle, { color: drawerTheme.text }]}>
            Spediak
          </Text>
          <Text style={[styles.drawerSubtitle, { color: drawerTheme.tabIconDefault }]}>
            Your Inspection Assistant
          </Text>
        </View>
        
        {/* Standard drawer items */}
        <DrawerItemList {...props} />
        
        {/* Custom logout item at bottom */}
        <View style={[styles.logoutContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color={drawerTheme.danger} />
            <Text style={[styles.logoutText, { color: drawerTheme.danger }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    );
  }

  // Get the screen width for responsive drawer width
  const screenWidth = Dimensions.get('window').width;
  const drawerWidth = Math.min(screenWidth * 0.8, 300); // 80% of screen width, max 300px

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: drawerTheme.background,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
        },
        headerTintColor: drawerTheme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveBackgroundColor: drawerTheme.tint,
        drawerActiveTintColor: drawerTheme.background,
        drawerInactiveTintColor: drawerTheme.text,
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 16,
        },
        drawerStyle: {
          width: drawerWidth,
          backgroundColor: drawerTheme.background,
        },
        // Enhanced animation for drawer
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.5)',
        swipeEdgeWidth: 50, // Increase the area where swipe begins
        swipeMinDistance: 20, // Make it easier to open with swipe
      }}
    >
      <Drawer.Screen
        name="index" // This maps to (app)/index.tsx - New Inspection screen
        options={{
          title: 'New Inspection',
          headerTitle: 'New Inspection',
          drawerIcon: ({ color }) => <Ionicons name="camera-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="history" // This maps to (app)/history.tsx - Inspection History
        options={{
          title: 'Inspection History',
          headerTitle: 'Inspection History',
          drawerIcon: ({ color }) => <Ionicons name="time-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile" // This maps to (app)/profile.tsx - Profile Settings
        options={{
          title: 'Profile Settings',
          headerTitle: 'Profile Settings',
          drawerIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
      {/* We don't add logout here as we handle it in the custom drawer content */}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: 10,
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  drawerSubtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  logoutContainer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 30,
    fontSize: 16,
    fontWeight: '500',
  },
}); 