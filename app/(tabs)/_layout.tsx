import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Clean, minimalist look
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#2d5a2e', // Deep Agritech green for the active tab
        tabBarInactiveTintColor: '#94A3B8', // Soft grey for inactive tabs
      }}
    >
      {/* Notice this is now 'home' instead of 'index' */}
      <Tabs.Screen
        name="home"
        options={{ tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="reports"
        options={{ tabBarIcon: ({ color }) => <Feather name="file-text" size={24} color={color} /> }}
      />
      {/* The Input button is now completely uniform with the rest */}
      <Tabs.Screen
        name="input"
        options={{ tabBarIcon: ({ color }) => <Feather name="plus-circle" size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ tabBarIcon: ({ color }) => <Feather name="clock" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    height: Platform.OS === 'ios' ? 85 : 70,
  },
});