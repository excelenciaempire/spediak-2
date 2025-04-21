import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface DrawerButtonProps {
  color?: string;
  size?: number;
}

export default function DrawerButton({ color, size = 24 }: DrawerButtonProps) {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  const handlePress = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Ionicons 
        name="menu-outline" 
        size={size} 
        color={color || Colors[colorScheme || 'light'].text} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
}); 