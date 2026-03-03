import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../assets/images/splash-bg.jpeg')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.heroTitle}>Soilwise</Text>
          
          <Text style={styles.heroSubtitle}>
            Interactive crop evaluations.{'\n'}Generated in real-time.
          </Text>
          
          <TouchableOpacity 
            style={styles.getStartedButton} 
            activeOpacity={0.8}
            onPress={() => router.replace('/(tabs)/home')} 
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Optional dark overlay for better text visibility
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  heroTitle: {
    fontSize: 90,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -2,
    marginBottom: 16,
  },

  heroSubtitle: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
    letterSpacing: -0.2,
  },

  getStartedButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ffffff',
  },

  getStartedButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});