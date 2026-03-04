import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { database } from '../../src/database';
import Evaluation from '../../src/database/models/Evaluation';

type ModalType = 'about' | 'language' | 'clear' | 'privacy' | 'success' | null;

export default function SettingsScreen() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('English');

  // --- EXPORT DATA ---
  const handleExportData = async () => {
    try {
      const evaluations = await database.collections
        .get<Evaluation>('evaluation_results')
        .query()
        .fetch();

      if (evaluations.length === 0) {
        Alert.alert('No Data', 'There are no evaluations to export yet.');
        return;
      }

      const header = 'Date,Crop,Season,LSI Score,Suitability Class,Limiting Factors\n';
      const rows = evaluations.map(record => {
        const dateStr = record.createdAt
          ? record.createdAt.toLocaleString('en-US', {
              timeZone: 'Asia/Manila',
              month: 'short', day: 'numeric', year: 'numeric',
            })
          : 'Unknown';
        return `"${dateStr}","${record.cropId}","${record.season || 'N/A'}","${record.lsi}","${record.lsc}","${record.limitingFactors}"`;
      });

      const csvContent = header + rows.join('\n');
      const fileName = `SoilWise_Export_${Date.now()}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export SoilWise Data',
        });
      } else {
        Alert.alert('Saved', `File saved to:\n${fileUri}`);
      }
    } catch (error) {
      Alert.alert('Export Failed', 'There was an error generating the export file.');
    }
  };

  // --- DATABASE ACTION ---
  const executeClearData = async () => {
    try {
      await database.write(async () => {
        const evaluations = await database.collections.get('evaluation_results').query().fetch();
        const recordsToDestroy = evaluations.map(record => record.prepareDestroyPermanently());
        await database.batch(...recordsToDestroy);
      });
      setActiveModal('success');
    } catch (error) {
      console.error(error);
    }
  };

  // --- MODAL CONTENT RENDERER (NO ICONS) ---
  const renderModalContent = () => {
    switch (activeModal) {
      case 'language':
        return (
          <>
            <Text style={styles.modalTitle}>Language</Text>
            <Text style={styles.modalBody}>Select your preferred language.</Text>
            
            <View style={styles.languageOptionsContainer}>
              <TouchableOpacity 
                style={styles.languageOption} 
                activeOpacity={0.6}
                onPress={() => { setLanguage('English'); setActiveModal(null); }}
              >
                <Text style={[styles.languageOptionText, language === 'English' && styles.languageOptionTextActive]}>English</Text>
              </TouchableOpacity>
              <View style={styles.modalDivider} />
              <TouchableOpacity 
                style={styles.languageOption} 
                activeOpacity={0.6}
                onPress={() => { setLanguage('Filipino'); setActiveModal(null); }}
              >
                <Text style={[styles.languageOptionText, language === 'Filipino' && styles.languageOptionTextActive]}>Filipino</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalButton} activeOpacity={0.8} onPress={() => setActiveModal(null)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 'clear':
        return (
          <>
            <Text style={styles.modalTitle}>Clear All Data</Text>
            <Text style={styles.modalBody}>Are you sure you want to permanently delete all your saved crop evaluations? This action cannot be undone.</Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalButton} activeOpacity={0.8} onPress={() => setActiveModal(null)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonDestructive} activeOpacity={0.8} onPress={executeClearData}>
                <Text style={styles.modalButtonTextDestructive}>Delete All</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 'success':
        return (
          <>
            <Text style={styles.modalTitle}>Data Cleared</Text>
            <Text style={styles.modalBody}>All your local evaluation data has been successfully deleted from the device.</Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalButtonPrimary} activeOpacity={0.8} onPress={() => setActiveModal(null)}>
                <Text style={styles.modalButtonTextPrimary}>Close</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 'privacy':
        return (
          <>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <Text style={styles.modalBody}>
              SoilWise operates entirely offline. All your soil inputs, location data, and evaluation results are stored securely on your local device. We do not collect, track, or share your personal data with any external servers.
            </Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalButton} activeOpacity={0.8} onPress={() => setActiveModal(null)}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 'about':
        return (
          <>
            <View style={styles.modalHeaderStack}>
              <Text style={styles.modalTitle}>Soilwise</Text>
              <Text style={styles.modalSubtitle}>Version 1.0.0</Text>
            </View>

            <View style={styles.modalInfoBox}>
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Developer</Text>
                <Text style={styles.infoValue}>Sayr</Text>
              </View>
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>College</Text>
                <Text style={styles.infoValue}>College of Information and Computing Sciences</Text>
              </View>
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>University</Text>
                <Text style={styles.infoValue}>Mindanao State University Main Campus</Text>
              </View>
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalButton} activeOpacity={0.8} onPress={() => setActiveModal(null)}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>App preferences & info</Text>
        </View>

        {/* App Section */}
        <Text style={styles.sectionLabel}>APP</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Notifications</Text>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ true: '#2d5a2e', false: '#cbd5e1' }}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => setActiveModal('language')}>
            <Text style={styles.rowLabel}>Language</Text>
            <Text style={styles.rowValue}>{language}</Text>
            <Feather name="chevron-right" size={20} color="#94A3B8" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <Text style={styles.sectionLabel}>DATA</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={handleExportData}>
            <Text style={styles.rowLabel}>Export Data</Text>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => setActiveModal('clear')}>
            <Text style={[styles.rowLabel, { color: '#ef4444' }]}>Clear All Data</Text>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => setActiveModal('about')}>
            <Text style={styles.rowLabel}>About Soilwise</Text>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => setActiveModal('privacy')}>
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* --- UNIFIED CUSTOM MODAL --- */}
      <Modal visible={activeModal !== null} transparent={true} animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveModal(null)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            {renderModalContent()}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { padding: 24, paddingTop: 80, paddingBottom: 120 },
  header: { marginBottom: 40 },
  title: { fontSize: 40, fontWeight: '700', color: '#0F172A', letterSpacing: -1.5 },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#94A3B8', letterSpacing: 1.2, marginBottom: 12, marginLeft: 8 },
  
  // Main List Styles
  card: { backgroundColor: '#F8FAFC', borderRadius: 24, marginBottom: 32, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0F172A' },
  rowValue: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 20 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    width: '100%',
    borderRadius: 28,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeaderStack: { marginBottom: 28 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  modalBody: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 32 },
  
  // Custom Content Boxes
  modalInfoBox: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 32, gap: 16 },
  infoGroup: { flexDirection: 'column' },
  infoLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#0F172A', lineHeight: 22 },
  
  // Language Specific
  languageOptionsContainer: { backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 32 },
  languageOption: { paddingVertical: 16, paddingHorizontal: 20 },
  languageOptionText: { fontSize: 16, color: '#475569', fontWeight: '500' },
  languageOptionTextActive: { color: '#2d5a2e', fontWeight: '700' },
  modalDivider: { height: 1, backgroundColor: '#E2E8F0' },

  // Buttons
  modalActionRow: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  modalButtonPrimary: { flex: 1, backgroundColor: '#2d5a2e', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  modalButtonDestructive: { flex: 1, backgroundColor: '#fef2f2', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  
  modalButtonText: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  modalButtonTextPrimary: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  modalButtonTextDestructive: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
});