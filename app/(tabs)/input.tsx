import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
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
  const [showClearModal, setShowClearModal] = useState(false);

  const isSeasonalCrop = SEASONAL_CROPS.includes(formData.crop);
  const showClayActivity = formData.cec === '16' || formData.cec === '16.0';

  const updateField = (key: keyof typeof initialFormState, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const clearForm = () => setShowClearModal(true);

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

  // --- DOWNLOAD CSV TEMPLATE (mirrors Python desktop version: PARAMETER | VALUE | NOTES) ---
  const handleDownloadTemplate = async () => {
    try {
      const rows: (string | null)[][] = [];

      const addTitle = (text: string) => {
        rows.push([text, null, null]);
        rows.push([null, null, null]);
      };

      const addInstruction = (text: string) => {
        rows.push([text, null, null]);
        rows.push([null, null, null]);
      };

      const addSection = (title: string, fields: [string, string][]) => {
        rows.push([title, null, null]);
        rows.push(['PARAMETER', 'VALUE', 'NOTES / OPTIONS']);
        fields.forEach(([param, note]) => rows.push([param, '', note]));
        rows.push([null, null, null]);
      };

      addTitle('SoilWise - Soil Data Input Template');
      addInstruction('Instructions: Fill in the VALUE column with your data. Do not modify the PARAMETER column.');

      addSection('CROP SELECTION', [
        ['Crop Name', `Options: ${CROPS.join(', ')}`],
        ['Season (if applicable)', 'For seasonal crops: January - April (Dry Season), May - August (Wet Season), September - December (Cool Season)'],
      ]);

      addSection('LOCATION', [
        ['Site Name', `Options: ${BARANGAYS.join(', ')}`],
      ]);

      addSection('CLIMATE CHARACTERISTICS', [
        ['Average Temperature (°C)', 'Range: 0-50°C'],
        ['Annual Rainfall (mm)', 'Range: 0-5000 mm'],
        ['Humidity (%)', 'Range: 0-100%'],
      ]);

      addSection('TOPOGRAPHY', [
        ['Slope (%)', 'Range: 0-100%'],
      ]);

      addSection('WETNESS', [
        ['Flooding', `Options: ${FLOODING_CLASSES.join(', ')}`],
        ['Drainage', `Options: ${DRAINAGE_CLASSES.join(', ')}`],
      ]);

      addSection('PHYSICAL SOIL CHARACTERISTICS', [
        ['Texture', `Options: ${TEXTURES.join(', ')}`],
        ['Coarse Fragments (vol%)', 'Range: 0-100%'],
        ['Soil Depth (cm)', 'Range: 0-300 cm'],
        ['CaCO3 (%)', 'Range: 0-100%'],
        ['Gypsum (%)', 'Range: 0-100%'],
      ]);

      addSection('SOIL FERTILITY CHARACTERISTICS', [
        ['Apparent CEC (cmol/kg clay)', 'Range: 0-200'],
        ['Clay Activity Type (if CEC=16)', `Options: ${CLAY_ACTIVITIES.join(', ')}`],
        ['Sum of Basic Cations (cmol/kg)', 'Range: 0-100'],
        ['Base Saturation (%)', 'Range: 0-100%'],
        ['pH (H2O)', 'Range: 0-14'],
        ['Organic Carbon (%)', 'Range: 0-10%'],
      ]);

      addSection('SALINITY & ALKALINITY', [
        ['ECe (dS/m)', 'Range: 0-20'],
        ['ESP (%)', 'Range: 0-100%'],
      ]);

      // Serialize to CSV with proper quoting
      const escapeCell = (val: string | null): string => {
        if (val === null || val === undefined) return '';
        const s = String(val);
        if (s.includes(',') || s.includes('\n') || s.includes('"')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      const csvContent = rows.map(row => row.map(escapeCell).join(',')).join('\n');
      const fileUri = FileSystem.documentDirectory + 'SoilWise_Template.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Save SoilWise Template' });
      } else {
        Alert.alert('Saved', `Template saved to:\n${fileUri}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not generate template: ' + String(error));
    }
  };

  // --- IMPORT CSV (mirrors Python import_excel: reads PARAMETER → VALUE pairs) ---
  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });

      // Parse a single CSV line respecting quoted fields
      const parseCSVLine = (line: string): string[] => {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
            else { inQuotes = !inQuotes; }
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        return values;
      };

      // Build PARAMETER → VALUE dict (mirrors Python: row[0]=param, row[1]=value)
      const dataDict: Record<string, string> = {};
      for (const line of content.split('\n')) {
        const cols = parseCSVLine(line.trim());
        const param = cols[0]?.trim();
        const value = cols[1]?.trim();
        if (param && value && value !== '' && param !== 'PARAMETER' && param !== 'VALUE') {
          dataDict[param] = value;
        }
      }

      if (Object.keys(dataDict).length === 0) {
        Alert.alert('Empty File', 'No data found. Make sure you filled in the VALUE column.');
        return;
      }

      const imported: Partial<typeof initialFormState> = {};
      let importedCount = 0;

      // CROP — fuzzy match like Python
      if (dataDict['Crop Name']) {
        const match = CROPS.find(c => c.toLowerCase() === dataDict['Crop Name'].toLowerCase());
        if (match) { imported.crop = match; importedCount++; }
      }

      // SEASON
      if (dataDict['Season (if applicable)']) {
        const match = SEASONS.find(s => s.toLowerCase().includes(dataDict['Season (if applicable)'].toLowerCase()));
        if (match) { imported.season = match; importedCount++; }
      }

      // LOCATION
      if (dataDict['Site Name']) {
        const match = BARANGAYS.find(b => b.toLowerCase() === dataDict['Site Name'].toLowerCase());
        if (match) { imported.location = match; importedCount++; }
      }

      // CLIMATE
      const temp = dataDict['Average Temperature (°C)'] || dataDict['Average Temperature (C)'];
      if (temp) { imported.temperature = temp; importedCount++; }
      if (dataDict['Annual Rainfall (mm)']) { imported.rainfall = dataDict['Annual Rainfall (mm)']; importedCount++; }
      if (dataDict['Humidity (%)']) { imported.humidity = dataDict['Humidity (%)']; importedCount++; }

      // TOPOGRAPHY
      if (dataDict['Slope (%)']) { imported.slope = dataDict['Slope (%)']; importedCount++; }

      // WETNESS — match by code prefix like Python (e.g. "Fo" → "Fo - No flooding")
      if (dataDict['Flooding']) {
        const code = dataDict['Flooding'].trim();
        const match = FLOODING_CLASSES.find(f => f.startsWith(code + ' -') || f === code);
        if (match) { imported.flooding = match; importedCount++; }
      }
      if (dataDict['Drainage']) {
        const code = dataDict['Drainage'].trim();
        const match = DRAINAGE_CLASSES.find(d => d.startsWith(code + ' -') || d === code);
        if (match) { imported.drainage = match; importedCount++; }
      }

      // PHYSICAL SOIL
      if (dataDict['Texture']) {
        const code = dataDict['Texture'].trim();
        const match = TEXTURES.find(t => t.startsWith(code + ' -') || t === code);
        if (match) { imported.texture = match; importedCount++; }
      }
      if (dataDict['Coarse Fragments (vol%)']) { imported.coarseFragments = dataDict['Coarse Fragments (vol%)']; importedCount++; }
      if (dataDict['Soil Depth (cm)']) { imported.soilDepth = dataDict['Soil Depth (cm)']; importedCount++; }
      const caco3 = dataDict['CaCO3 (%)'] || dataDict['CaCO₃ (%)'];
      if (caco3) { imported.caco3 = caco3; importedCount++; }
      if (dataDict['Gypsum (%)']) { imported.gypsum = dataDict['Gypsum (%)']; importedCount++; }

      // SOIL FERTILITY
      if (dataDict['Apparent CEC (cmol/kg clay)']) { imported.cec = dataDict['Apparent CEC (cmol/kg clay)']; importedCount++; }
      if (dataDict['Clay Activity Type (if CEC=16)']) {
        const match = CLAY_ACTIVITIES.find(a => a.toLowerCase().includes(dataDict['Clay Activity Type (if CEC=16)'].toLowerCase()));
        if (match) { imported.clayActivity = match; importedCount++; }
      }
      if (dataDict['Sum of Basic Cations (cmol/kg)']) { imported.basicCations = dataDict['Sum of Basic Cations (cmol/kg)']; importedCount++; }
      if (dataDict['Base Saturation (%)']) { imported.baseSaturation = dataDict['Base Saturation (%)']; importedCount++; }
      const ph = dataDict['pH (H2O)'] || dataDict['pH (H₂O)'];
      if (ph) { imported.ph = ph; importedCount++; }
      if (dataDict['Organic Carbon (%)']) { imported.organicCarbon = dataDict['Organic Carbon (%)']; importedCount++; }

      // SALINITY & ALKALINITY
      if (dataDict['ECe (dS/m)']) { imported.ece = dataDict['ECe (dS/m)']; importedCount++; }
      if (dataDict['ESP (%)']) { imported.esp = dataDict['ESP (%)']; importedCount++; }

      setFormData(prev => ({ ...prev, ...imported }));
      Alert.alert('Import Successful', `${importedCount} field(s) populated successfully!`);
    } catch (error) {
      Alert.alert('Import Error', String(error));
    }
  };

  return (
    <>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Soil Data Input</Text>
          <Text style={styles.headerSubtitle}>Enter detailed soil and landscape characteristics</Text>
        </View>

        {/* Quick Import */}
        <View style={styles.card}>
          <SectionHeader title="Data Import/Template" icon="file-text" />
          <View style={styles.importActionRow}>
            <TouchableOpacity style={styles.outlineButton} activeOpacity={0.7} onPress={handleDownloadTemplate}>
              <Feather name="download" size={16} color="#475569" style={{ marginRight: 6 }} />
              <Text style={styles.outlineButtonText}>Template</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tintedButton} activeOpacity={0.7} onPress={handleImportCSV}>
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
            label="Soil Texture" placeholder="Select texture..." 
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

      {/* --- CLEAR FORM CONFIRMATION MODAL --- */}
      <Modal
        visible={showClearModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowClearModal(false)}
      >
        <TouchableOpacity style={styles.clearModalOverlay} activeOpacity={1} onPress={() => setShowClearModal(false)}>
          <View style={styles.clearModalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.clearModalIconBox}>
              <Feather name="refresh-ccw" size={24} color="#f97316" />
            </View>
            <Text style={styles.clearModalTitle}>Clear Form</Text>
            <Text style={styles.clearModalBody}>
              Are you sure you want to clear all inputs? All entered values will be lost.
            </Text>
            <View style={styles.clearModalActionRow}>
              <TouchableOpacity style={styles.clearModalButton} activeOpacity={0.8} onPress={() => setShowClearModal(false)}>
                <Text style={styles.clearModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearModalButtonDestructive}
                activeOpacity={0.8}
                onPress={() => { setFormData(initialFormState); setShowClearModal(false); }}
              >
                <Text style={styles.clearModalButtonTextDestructive}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
  secondaryButtonText: { color: '#64748B', fontSize: 16, fontWeight: '600' },

  // Clear Form Modal
  clearModalOverlay: {
    flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  clearModalCard: {
    backgroundColor: '#ffffff', width: '100%', borderRadius: 28, padding: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 10,
  },
  clearModalIconBox: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  clearModalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, marginBottom: 8 },
  clearModalBody: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 32 },
  clearModalActionRow: { flexDirection: 'row', gap: 12 },
  clearModalButton: {
    flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 14,
    paddingHorizontal: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  clearModalButtonDestructive: {
    flex: 1, backgroundColor: '#fff7ed', paddingVertical: 14,
    paddingHorizontal: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#fed7aa',
  },
  clearModalButtonText: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  clearModalButtonTextDestructive: { color: '#f97316', fontSize: 15, fontWeight: '700' },
});