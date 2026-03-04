import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LandingScreen() {
  const router = useRouter();
  
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [isCheckingFirstLaunch, setIsCheckingFirstLaunch] = useState(true);

  // 1. Check storage immediately when the app opens
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasSeenGuide = await AsyncStorage.getItem('hasSeenGuide');
        
        if (hasSeenGuide === 'true') {
          // User has been here before, skip straight to the Home tab
          router.replace('/(tabs)/home');
        } else {
          // First time opening the app! Stop checking and show the landing page.
          setIsCheckingFirstLaunch(false);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        setIsCheckingFirstLaunch(false); // Default to showing it if there's an error
      }
    };

    checkOnboardingStatus();
  }, []);

  // 2. Save to storage when they finally click "Start Evaluation"
  const handleCompleteGuide = async () => {
    try {
      await AsyncStorage.setItem('hasSeenGuide', 'true');
      setIsGuideVisible(false);
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      // Even if storage fails, we should still let them into the app
      router.replace('/(tabs)/home');
    }
  };

  // Prevent a "flash" of the landing page while checking the device's storage
  if (isCheckingFirstLaunch) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D140E' }]}>
        <ActivityIndicator size="large" color="#2d5a2e" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/splash-bg.png')}
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
            activeOpacity={0.7}
            onPress={() => setIsGuideVisible(true)} 
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- THEMED SOILWISE GUIDE MODAL (NO ICONS) --- */}
      <Modal
        visible={isGuideVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsGuideVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            
            <Text style={styles.modalTitle}>Getting Started</Text>
            <Text style={styles.modalGreeting}>Learn how to use Soilwise.</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
                <View style={styles.guideStep}>
                    <Text style={styles.stepTitle}>1. Input Parameters</Text>
                    <Text style={styles.modalBody}>
                        Enter 22 key soil and climate characteristics including pH, temperature, and slope.
                    </Text>
                </View>

                <View style={styles.guideStep}>
                    <Text style={styles.stepTitle}>2. Real-time Analysis</Text>
                    <Text style={styles.modalBody}>
                        Our engine uses the Square Root Method to calculate a precise Land Suitability Index (LSI).
                    </Text>
                </View>

                <View style={styles.guideStep}>
                    <Text style={styles.stepTitle}>3. Offline Reports</Text>
                    <Text style={styles.modalBody}>
                        Access detailed suitability classifications and tailored recommendations anywhere, even without internet.
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Action Row */}
            <View style={styles.modalActionRow}>
              
              <TouchableOpacity 
                style={styles.modalBackButton} 
                activeOpacity={0.7}
                onPress={() => setIsGuideVisible(false)}
              >
                <Text style={styles.modalBackButtonText}>Back</Text>
              </TouchableOpacity>

              {/* Hooked up the new handleCompleteGuide function here */}
              <TouchableOpacity 
                style={styles.modalFinalButton} 
                activeOpacity={0.9}
                onPress={handleCompleteGuide}
              >
                <Text style={styles.modalFinalButtonText}>Start Evaluation</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.40)', 
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  getStartedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4, 
  },
  getStartedButtonText: {
    color: '#ffffff', 
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // --- MODAL THEME ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 12, 0.85)', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#0D140E', 
    width: '100%',
    maxWidth: 440,
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(168, 196, 168, 0.15)', 
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  modalGreeting: {
    fontSize: 16,
    color: '#A8C4A8', 
    fontWeight: '500',
    marginBottom: 24,
    marginTop: 4,
  },
  scrollArea: {
    maxHeight: 300,
    marginBottom: 32,
  },
  guideStep: {
    marginBottom: 20,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalBody: {
    fontSize: 14,
    color: '#94A3B8', 
    lineHeight: 22,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBackButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackButtonText: {
    color: '#A8C4A8',
    fontSize: 16,
    fontWeight: '600',
  },
  modalFinalButton: {
    backgroundColor: '#2d5a2e', 
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2d5a2e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  modalFinalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});