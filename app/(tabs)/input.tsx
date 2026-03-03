import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';

// Import the database and your new Evaluation Engine!
import { database } from '../../src/database';
import Evaluation from '../../src/database/models/Evaluation';
import EvaluationEngine from '../../src/utils/EvaluationEngine';

// --- CONSTANTS FROM PYTHON KNOWLEDGE BASE ---

const CROPS = [
  "Arabica Coffee", "Banana", "Cabbage", "Carrots", "Cocoa",
  "Maize", "Oil Palm", "Pineapple", "Robusta Coffee",
  "Sorghum", "Sugarcane", "Sweet Potato", "Tomato"
];

const SEASONAL_CROPS = ["Cabbage", "Carrots", "Maize", "Sorghum", "Sweet Potato", "Tomato"];

const SEASONS = [
  "January - April (Dry Season)",
  "May - August (Wet Season)",
  "September - December (Cool Season)"
];

const BARANGAYS = [
  "Aposong", "Bagoaingud", "Bangco (Pob.)", "Bansayan", "Basak", "Bobo", "Bualan", 
  "Bubong Ilian", "Bubong Tawa-an", "Bubonga Mamaanun", "Gacap", "Ilian", 
  "Ilian Poblacion", "Kalanganan", "Katumbacan", "Lininding", "Lumbaca Mamaan", 
  "Mamaanun", "Mentring", "Olango", "Palacat", "Palao", "Paling", "Pantaon", 
  "Pantar", "Paridi", "Pindolonan", "Radapan", "Radapan Poblacion", "Rantian", 
  "Sapingit", "Talao", "Tambo", "Tapocan", "Taporug", "Tawaan", "Udalo"
];

const TEXTURES = [
  "C - Clay", "C<60s - Clay (<60% clay, moderately heavy)", "C>60s - Clay (>60% clay, heavy clay)", 
  "C>60v - Clay (>60% clay, very heavy clay)", "CL - Clay Loam", "Cm - Clay montmorillonitic", 
  "Co - Clay oxidic", "L - Loam", "LS - Loamy Sand", "LcS - Loamy coarse Sand", 
  "LfS - Loamy fine Sand", "S - Sand", "SC - Sandy Clay", "SCL - Sandy Clay Loam", 
  "SL - Sandy Loam", "SiC - Silty Clay", "SiCL - Silty Clay Loam", "SiCm - Silty Clay montmorillonitic", 
  "SiCs - Silty Clay smectitic", "SiL - Silt Loam", "cS - coarse Sand", "fS - fine Sand", "Si - Silt"
];

const FLOODING_CLASSES = [
  "Fo - No flooding",
  "F1 - Occasional flooding",
  "F2 - Frequent flooding",
  "F3 - Very frequent flooding",
  "F3+ - Severe flooding"
];

const DRAINAGE_CLASSES = [
  "good - Well drained",
  "good_gw_over_150 - Good drainage, groundwater >150 cm",
  "good_gw_100_150 - Good drainage, groundwater 100-150 cm",
  "moderate - Moderately drained",
  "imperfect - Imperfectly drained",
  "poor_drainable - Poorly drained but drainable",
  "poor_not_drainable - Poorly drained, not drainable",
  "poor_aeric - Poorly drained, aeric conditions",
  "poor - Poorly drained",
  "very_poor - Very poorly drained"
];

const CLAY_ACTIVITIES = [
  "Low activity (1:1 clays - Kaolinite) → Treats as 16(-)",
  "High activity (2:1 clays - Montmorillonite) → Treats as 16(+)"
];

// --- REUSABLE UI COMPONENTS ---

const SectionHeader = ({ title, icon }: { title: string, icon: keyof typeof Feather.glyphMap }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconBox}>
      <Feather name={icon} size={18} color="#5a9d5e" />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const InputField = ({ label, placeholder, value, onChangeText }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput 
      style={styles.textInput} 
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      keyboardType="decimal-pad"
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

const SelectField = ({ label, placeholder, value, options, onSelect }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.selectInput} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
        <Text style={[styles.selectText, value && { color: '#0F172A' }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color="#64748B" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                <Feather name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, value === item && styles.modalOptionTextSelected]}>
                    {item}
                  </Text>
                  {value === item && <Feather name="check" size={20} color="#2d5a2e" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// --- MAIN SCREEN ---

export default function InputScreen() {
  const router = useRouter();
  
  const initialFormState = {
    crop: '', season: '', location: '',
    temperature: '', rainfall: '', humidity: '',
    slope: '', flooding: '', drainage: '',
    texture: '', coarseFragments: '', soilDepth: '', caco3: '', gypsum: '',
    cec: '', clayActivity: '', basicCations: '', baseSaturation: '', ph: '', organicCarbon: '',
    ece: '', esp: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const isSeasonalCrop = SEASONAL_CROPS.includes(formData.crop);
  const showClayActivity = formData.cec === '16' || formData.cec === '16.0';

  const updateField = (key: keyof typeof initialFormState, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const clearForm = () => {
    Alert.alert("Clear Form", "Are you sure you want to clear all inputs?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => setFormData(initialFormState) }
    ]);
  };

  // --- THE REAL DATABASE EVALUATION FUNCTION ---
  const handleRunAnalysis = async () => {
    if (!formData.crop) {
      Alert.alert("Missing Information", "Please select a crop to evaluate.");
      return;
    }
    if (isSeasonalCrop && !formData.season) {
      Alert.alert("Missing Information", "This is a seasonal crop. Please select a growing season.");
      return;
    }

    try {
      let newEvaluationId = '';

      // 1. Fetch Crop Requirements JSON from WatermelonDB
      const cropsCollection = database.collections.get<any>('crops');
      const allCrops = await cropsCollection.query().fetch();
      const cropRecord = allCrops.find((c: any) => c.cropName === formData.crop);

      if (!cropRecord) {
        Alert.alert("Data Error", `Could not find requirements for ${formData.crop}. Did you seed the database?`);
        return;
      }

      const cropData = JSON.parse(cropRecord.requirementsJson);

      // 2. Map UI Season to JSON Season Keys
      let seasonKey = null;
      if (formData.season === "January - April (Dry Season)") seasonKey = "january_april";
      else if (formData.season === "May - August (Wet Season)") seasonKey = "may_august";
      else if (formData.season === "September - December (Cool Season)") seasonKey = "september_december";

      // 3. Run the Square Root Method via the Evaluation Engine
      const result = EvaluationEngine.evaluate(formData.crop, formData, cropData, seasonKey);

      // Format limiting factors (e.g. "ft" -> "f, t") so the Reports page can decode them easily
      const formattedFactors = result.limitingFactors ? result.limitingFactors.split('').join(', ') : "None";

      // 4. Save to Database
      await database.write(async () => {
        const newRecord = await database.collections.get<Evaluation>('evaluation_results').create((record) => {
          record.inputId = `input_${Date.now()}`;
          record.cropId = formData.crop;
          record.season = formData.season || null;
          
          // Real Data!
          record.lsi = result.lsi;
          record.lsc = result.lsc;
          record.fullClassification = result.fullClassification;
          record.limitingFactors = formattedFactors;
          record.syncedToServer = false;
        });
        newEvaluationId = newRecord.id; 
      });

      // 5. Navigate to Reports
      router.push({
        pathname: '/reports',
        params: { id: newEvaluationId }
      });

    } catch (error) {
      Alert.alert("Error evaluating crop", String(error));
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Soil Data Input</Text>
          <Text style={styles.headerSubtitle}>Enter detailed soil and landscape characteristics</Text>
        </View>

        {/* Quick Import */}
        <View style={styles.card}>
          <SectionHeader title="Data Import/Export" icon="file-text" />
          <View style={styles.importActionRow}>
            <TouchableOpacity style={styles.outlineButton} activeOpacity={0.7}>
              <Feather name="download" size={16} color="#475569" style={{ marginRight: 6 }} />
              <Text style={styles.outlineButtonText}>Template</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tintedButton} activeOpacity={0.7}>
              <Feather name="upload" size={16} color="#2d5a2e" style={{ marginRight: 6 }} />
              <Text style={styles.tintedButtonText}>Import</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. Crop Selection */}
        <View style={styles.card}>
          <SectionHeader title="Crop Selection" icon="target" />
          <SelectField 
            label="Select Crop" placeholder="Choose a crop..." 
            value={formData.crop} onSelect={(val: string) => updateField('crop', val)}
            options={CROPS} 
          />
          {isSeasonalCrop && (
            <SelectField 
              label="Growing Season" placeholder="Select season..." 
              value={formData.season} onSelect={(val: string) => updateField('season', val)}
              options={SEASONS} 
            />
          )}
        </View>

        {/* 2. Location */}
        <View style={styles.card}>
          <SectionHeader title="Location Information" icon="map-pin" />
          <SelectField 
            label="Site Name (Barangay)" placeholder="Select barangay..." 
            value={formData.location} onSelect={(val: string) => updateField('location', val)}
            options={BARANGAYS} 
          />
        </View>

        {/* 3. Climate Characteristics */}
        <View style={styles.card}>
          <SectionHeader title="Climate Characteristics" icon="cloud" />
          <InputField label="Average Temperature (°C)" placeholder="0.0" value={formData.temperature} onChangeText={(val: string) => updateField('temperature', val)} />
          <InputField label="Annual Rainfall (mm)" placeholder="0.0" value={formData.rainfall} onChangeText={(val: string) => updateField('rainfall', val)} />
          <InputField label="Humidity (%)" placeholder="0.0" value={formData.humidity} onChangeText={(val: string) => updateField('humidity', val)} />
        </View>

        {/* 4. Topography & Wetness */}
        <View style={styles.card}>
          <SectionHeader title="Topography & Wetness" icon="droplet" />
          <InputField label="Slope (%)" placeholder="0.0" value={formData.slope} onChangeText={(val: string) => updateField('slope', val)} />
          <SelectField 
            label="Flooding Class" placeholder="Select flooding class..." 
            value={formData.flooding} onSelect={(val: string) => updateField('flooding', val)}
            options={FLOODING_CLASSES} 
          />
          <SelectField 
            label="Drainage Class" placeholder="Select drainage class..." 
            value={formData.drainage} onSelect={(val: string) => updateField('drainage', val)}
            options={DRAINAGE_CLASSES} 
          />
        </View>

        {/* 5. Physical Soil */}
        <View style={styles.card}>
          <SectionHeader title="Physical Soil" icon="layers" />
          <SelectField 
            label="Soil Texture" placeholder="Select USDA texture..." 
            value={formData.texture} onSelect={(val: string) => updateField('texture', val)}
            options={TEXTURES} 
          />
          <InputField label="Coarse Fragments (vol %)" placeholder="0.0" value={formData.coarseFragments} onChangeText={(val: string) => updateField('coarseFragments', val)} />
          <InputField label="Soil Depth (cm)" placeholder="0.0" value={formData.soilDepth} onChangeText={(val: string) => updateField('soilDepth', val)} />
          <InputField label="CaCO₃ (%)" placeholder="0.0" value={formData.caco3} onChangeText={(val: string) => updateField('caco3', val)} />
          <InputField label="Gypsum (%)" placeholder="0.0" value={formData.gypsum} onChangeText={(val: string) => updateField('gypsum', val)} />
        </View>

        {/* 6. Soil Fertility */}
        <View style={styles.card}>
          <SectionHeader title="Soil Fertility" icon="sun" />
          <InputField label="Apparent CEC (cmol/kg clay)" placeholder="0.0" value={formData.cec} onChangeText={(val: string) => updateField('cec', val)} />
          
          {showClayActivity && (
             <SelectField 
              label="Clay Activity Type (Required for CEC=16)" placeholder="Select clay type..." 
              value={formData.clayActivity} onSelect={(val: string) => updateField('clayActivity', val)}
              options={CLAY_ACTIVITIES} 
            />
          )}

          <InputField label="Sum of Basic Cations (cmol/kg)" placeholder="0.0" value={formData.basicCations} onChangeText={(val: string) => updateField('basicCations', val)} />
          <InputField label="Base Saturation (%)" placeholder="0.0" value={formData.baseSaturation} onChangeText={(val: string) => updateField('baseSaturation', val)} />
          <InputField label="pH (H₂O)" placeholder="0.0" value={formData.ph} onChangeText={(val: string) => updateField('ph', val)} />
          <InputField label="Organic Carbon (%)" placeholder="0.0" value={formData.organicCarbon} onChangeText={(val: string) => updateField('organicCarbon', val)} />
        </View>

        {/* 7. Salinity & Alkalinity */}
        <View style={styles.card}>
          <SectionHeader title="Salinity & Alkalinity" icon="activity" />
          <InputField label="ECe (dS/m)" placeholder="0.0" value={formData.ece} onChangeText={(val: string) => updateField('ece', val)} />
          <InputField label="ESP (%)" placeholder="0.0" value={formData.esp} onChangeText={(val: string) => updateField('esp', val)} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={clearForm}>
            <Text style={styles.secondaryButtonText}>Clear Form</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={handleRunAnalysis}>
            <Text style={styles.primaryButtonText}>Run Analysis</Text>
            <Feather name="arrow-right" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 120 },
  header: { marginBottom: 32 },
  headerTitle: { fontSize: 36, fontWeight: '700', color: '#0F172A', letterSpacing: -1.5 },
  headerSubtitle: { fontSize: 15, color: '#64748B', marginTop: 8, lineHeight: 22 },
  card: { backgroundColor: '#F8FAFC', borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#eaf4ea', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', letterSpacing: -0.3 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8, marginLeft: 4 },
  textInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A' },
  selectInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectText: { fontSize: 15, color: '#94A3B8', flex: 1, paddingRight: 8 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalOptionText: { fontSize: 15, color: '#475569', flex: 1, paddingRight: 12 },
  modalOptionTextSelected: { color: '#2d5a2e', fontWeight: '700' },

  importActionRow: { flexDirection: 'row', gap: 12 },
  outlineButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#ffffff' },
  outlineButtonText: { color: '#475569', fontSize: 14, fontWeight: '600' },
  tintedButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 20, backgroundColor: '#eaf4ea' },
  tintedButtonText: { color: '#2d5a2e', fontSize: 14, fontWeight: '700' },
  actionContainer: { marginTop: 16, flexDirection: 'row', gap: 12 },
  primaryButton: { flex: 1, backgroundColor: '#2d5a2e', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 30, shadowColor: '#2d5a2e', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondaryButton: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 30 },
  secondaryButtonText: { color: '#64748B', fontSize: 16, fontWeight: '600' }
});