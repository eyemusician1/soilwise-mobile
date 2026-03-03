import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>App preferences & info</Text>
      </View>

      {/* App Section */}
      <Text style={styles.sectionLabel}>APP</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <View style={styles.iconBox}>
            <Feather name="bell" size={20} color="#0F172A" />
          </View>
          <Text style={styles.rowLabel}>Notifications</Text>
          <Feather name="chevron-right" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <View style={styles.iconBox}>
            <Feather name="globe" size={20} color="#0F172A" />
          </View>
          <Text style={styles.rowLabel}>Language</Text>
          <Feather name="chevron-right" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Data Section */}
      <Text style={styles.sectionLabel}>DATA</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <View style={styles.iconBox}>
            <Feather name="download-cloud" size={20} color="#0F172A" />
          </View>
          <Text style={styles.rowLabel}>Export Data</Text>
          <Feather name="chevron-right" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
            <Feather name="trash-2" size={20} color="#ef4444" />
          </View>
          <Text style={[styles.rowLabel, { color: '#ef4444' }]}>Clear All Data</Text>
          <Feather name="chevron-right" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <Text style={styles.sectionLabel}>ABOUT</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Feather name="info" size={20} color="#0F172A" />
          </View>
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <View style={styles.iconBox}>
            <Feather name="file-text" size={20} color="#0F172A" />
          </View>
          <Text style={styles.rowLabel}>Privacy Policy</Text>
          <Feather name="chevron-right" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  scrollContent: { 
    padding: 24, 
    paddingTop: 80, 
    paddingBottom: 120 
  },
  header: { 
    marginBottom: 40 
  },
  title: { 
    fontSize: 40, 
    fontWeight: '700', 
    color: '#0F172A', 
    letterSpacing: -1.5 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#64748B', 
    marginTop: 8 
  },
  sectionLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#94A3B8', 
    letterSpacing: 1.2, 
    marginBottom: 12, 
    marginLeft: 8 
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden', // Ensures the click ripple effect respects the rounded corners
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20 
  },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16,
    backgroundColor: '#F1F5F9' // Soft grey matching the layout
  },
  rowLabel: { 
    flex: 1, 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#0F172A' 
  },
  rowValue: { 
    fontSize: 15, 
    color: '#64748B', 
    fontWeight: '500' 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#E2E8F0', 
    marginLeft: 76 // Skips the icon to draw a clean line
  },
});