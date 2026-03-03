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
      
      {/* Darkened overlay to ensure white text remains extremely crisp */}
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.heroTitle}>Soilwise</Text>
          
          <Text style={styles.heroSubtitle}>
            Interactive crop evaluations.{'\n'}Generated in real-time.
          </Text>
          
          {/* Glassmorphism Button */}
          <TouchableOpacity 
            style={styles.getStartedButton} 
            activeOpacity={0.7}
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

  overlay: {
    flex: 1,
    // A slightly darker overlay (35% black) gives that professional cinematic contrast
    backgroundColor: 'rgba(0, 0, 0, 0.34)', 
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },

  heroTitle: {
    fontSize: 80,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -2,
    marginBottom: 16,
    // A softer, wider shadow creates a professional "glow" that separates it from the background
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },

  heroSubtitle: {
    fontSize: 18,
    color: '#f8fafc',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 48,
    letterSpacing: -0.2,
    fontWeight: '500',
    // Same soft shadow treatment for the subtitle
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },

  // --- GLASSMORPHISM BUTTON ---
  getStartedButton: {
    // 15% opaque white gives the "frosted glass" look
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    // The border acts as the "light reflection" on the edge of the glass
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)', 
    // Subtle shadow to lift the glass off the background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4, // For Android
  },

  getStartedButtonText: {
    color: '#ffffff', // White text to match the glass theme
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    // Add a tiny shadow to the button text so it doesn't get lost in the glass
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});