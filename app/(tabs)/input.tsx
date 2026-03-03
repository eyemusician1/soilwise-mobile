import { Feather } from '@expo/vector-icons';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- REUSABLE UI COMPONENTS (Google Material 3 Style) ---

const SectionHeader = ({ title, icon }: { title: string, icon: keyof typeof Feather.glyphMap }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconBox}>
      <Feather name={icon} size={18} color="#5a9d5e" />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const InputField = ({ label, placeholder, keyboardType = "numeric" }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput 
      style={styles.textInput} 
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      keyboardType={keyboardType}
    />
  </View>
);

const SelectField = ({ label, placeholder }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TouchableOpacity style={styles.selectInput} activeOpacity={0.7}>
      <Text style={styles.selectText}>{placeholder}</Text>
      <Feather name="chevron-down" size={20} color="#64748B" />
    </TouchableOpacity>
  </View>
);

// --- MAIN SCREEN ---

export default function InputScreen() {
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Analysis</Text>
          <Text style={styles.headerSubtitle}>Enter soil and climate parameters</Text>
        </View>


        {/* 1. Crop Selection */}
        <View style={styles.card}>
          <SectionHeader title="Crop Selection" icon="target" />
          <SelectField label="Select Crop" placeholder="e.g. Arabica Coffee, Banana..." />
          <SelectField label="Growing Season" placeholder="Select season (if applicable)" />
        </View>

        {/* 2. Location */}
        <View style={styles.card}>
          <SectionHeader title="Location Information" icon="map-pin" />
          <SelectField label="Site Name (Barangay)" placeholder="Select barangay..." />
        </View>

        {/* 3. Climate Characteristics */}
        <View style={styles.card}>
          <SectionHeader title="Climate Characteristics" icon="cloud" />
          <InputField label="Average Temperature (°C)" placeholder="0 - 50" />
          <InputField label="Annual Rainfall (mm)" placeholder="0 - 5000" />
          <InputField label="Humidity (%)" placeholder="0 - 100" />
        </View>

        {/* 4. Topography & Wetness */}
        <View style={styles.card}>
          <SectionHeader title="Topography & Wetness" icon="droplet" />
          <InputField label="Slope (%)" placeholder="0 - 100" />
          <SelectField label="Flooding Class" placeholder="Select flooding class..." />
          <SelectField label="Drainage Class" placeholder="Select drainage class..." />
        </View>

        {/* 5. Physical Soil Characteristics */}
        <View style={styles.card}>
          <SectionHeader title="Physical Soil Characteristics" icon="layers" />
          <SelectField label="Soil Texture" placeholder="Select texture..." />
          <InputField label="Coarse Fragments (vol %)" placeholder="0 - 100" />
          <InputField label="Soil Depth (cm)" placeholder="0 - 300" />
          <InputField label="CaCO₃ (%)" placeholder="0 - 100" />
          <InputField label="Gypsum (%)" placeholder="0 - 100" />
        </View>

        {/* 6. Soil Fertility */}
        <View style={styles.card}>
          <SectionHeader title="Soil Fertility" icon="sun" />
          <InputField label="Apparent CEC (cmol/kg clay)" placeholder="0 - 200" />
          <SelectField label="Clay Activity Type" placeholder="Low / High activity..." />
          <InputField label="Sum of Basic Cations (cmol/kg)" placeholder="0 - 100" />
          <InputField label="Base Saturation (%)" placeholder="0 - 100" />
          <InputField label="pH (H₂O)" placeholder="0 - 14" />
          <InputField label="Organic Carbon (%)" placeholder="0 - 10" />
        </View>

        {/* 7. Salinity & Alkalinity */}
        <View style={styles.card}>
          <SectionHeader title="Salinity & Alkalinity" icon="activity" />
          <InputField label="ECe (dS/m)" placeholder="0 - 20" />
          <InputField label="ESP (%)" placeholder="0 - 100" />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Clear Form</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Run Analysis</Text>
            <Feather name="arrow-right" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 32 
  },
  headerTitle: { 
    fontSize: 40, 
    fontWeight: '700', 
    color: '#0F172A', 
    letterSpacing: -1.5 
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#F8FAFC', 
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eaf4ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  selectInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 15,
    color: '#94A3B8',
  },
  importActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#ffffff',
  },
  outlineButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  tintedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#eaf4ea', // Soft green highlight
  },
  tintedButtonText: {
    color: '#2d5a2e',
    fontSize: 14,
    fontWeight: '700',
  },
  actionContainer: {
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2d5a2e', // Changed from black to deep green
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#2d5a2e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  }
});