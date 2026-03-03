import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Import your WatermelonDB instance and Evaluation model
import { database } from '../../src/database';
import Evaluation from '../../src/database/models/Evaluation';

export default function ReportsScreen() {
  const router = useRouter();
  
  // Capture the `id` passed from the Input screen's router.push()
  const { id } = useLocalSearchParams();
  
  const [reportData, setReportData] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the data from WatermelonDB whenever the ID changes
  useEffect(() => {
    if (id && typeof id === 'string' && id !== '') {
      setIsLoading(true);
      
      // Find the specific record in the database
      database.collections.get<Evaluation>('evaluation_results').find(id)
        .then((record) => {
          setReportData(record);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to load report", error);
          setReportData(null);
          setIsLoading(false);
        });
    } else {
      // If no ID is passed, show the empty state
      setReportData(null);
    }
  }, [id]);

  // --- PYTHON LOGIC TRANSLATIONS ---

  const getClassificationColor = (lsc: string) => {
    switch (lsc) {
      case 'S1': return '#22c55e'; // Bright Green
      case 'S2': return '#f59e0b'; // Amber
      case 'S3': return '#f97316'; // Orange
      case 'N': return '#ef4444';  // Red
      default: return '#3d5a3f';
    }
  };

  const decodeLimitingFactors = (factors: string | null) => {
    if (!factors || factors === "None") return "No significant limitations";
    
    // Map codes to full labels based on Python script
    const codes: Record<string, string> = {
        'c': 'Climate', 't': 'Topography', 'w': 'Wetness',
        's': 'Physical Soil', 'f': 'Soil Fertility', 'n': 'Salinity/Alkalinity'
    };

    return factors.split(',')
      .map(f => codes[f.trim().toLowerCase()] || f.trim().toUpperCase())
      .join(', ');
  };

  const generateDynamicRecommendations = (lsc: string, factors: string | null) => {
    if (lsc === 'S1') {
      return [
        "Maintain current organic matter levels with regular compost application.",
        "Monitor soil moisture during the dry season to prevent drought stress.",
        "Implement standard integrated pest management practices to protect yields."
      ];
    }

    const recs: string[] = [];
    const factorsStr = factors?.toLowerCase() || '';

    if (factorsStr.includes('t')) recs.push("Construct terraces, contour bounds, or plant vegetative strips to manage slope and prevent soil erosion.");
    if (factorsStr.includes('f')) recs.push("Apply appropriate NPK fertilizers and organic compost to boost soil fertility and correct pH imbalances.");
    if (factorsStr.includes('w')) recs.push("Improve field drainage systems (e.g., deep trenches) to prevent waterlogging during the wet season.");
    if (factorsStr.includes('s')) recs.push("Incorporate organic matter to improve soil texture, aeration, and root penetration depth.");
    
    if (recs.length === 0) {
      recs.push("Consult a local agricultural extension officer for specific interventions regarding your soil limitations.");
    }
    return recs;
  };

  // --- RENDER STATES ---

  // 1. Loading State
  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#2d5a2e" />
        <Text style={{ marginTop: 16, color: '#64748B', fontSize: 16 }}>Loading Evaluation Data...</Text>
      </View>
    );
  }

  // 2. Empty State (No ID provided or clear button clicked)
  if (!reportData) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Feather name="file-text" size={48} color="#94A3B8" />
        </View>
        <Text style={styles.emptyTitle}>No Reports Available</Text>
        <Text style={styles.emptySubtitle}>
          Start evaluating crops to generate detailed suitability reports and recommendations.
        </Text>
        <TouchableOpacity style={styles.emptyButton} activeOpacity={0.8} onPress={() => router.push('/input')}>
          <Text style={styles.emptyButtonText}>New Analysis</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Populated State (Data exists!)
  const classColor = getClassificationColor(reportData.lsc);
  const decodedFactors = decodeLimitingFactors(reportData.limitingFactors);
  const recommendations = generateDynamicRecommendations(reportData.lsc, reportData.limitingFactors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      <View style={styles.header}>
        <View style={styles.datePill}>
          <Feather name="clock" size={14} color="#5a9d5e" />
          <Text style={styles.dateText}>
            {reportData.createdAt ? reportData.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
          </Text>
        </View>
        <Text style={styles.headerTitle}>Evaluation Report</Text>
        <Text style={styles.headerSubtitle}>
          {reportData.cropId} {reportData.season ? `(${reportData.season.split('(')[0].trim()})` : ''}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryGrid}>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>LSI SCORE</Text>
            <Text style={[styles.summaryValue, { color: classColor }]}>{reportData.lsi.toFixed(2)}</Text>
            <Text style={styles.summarySubtext}>Out of 100</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>CLASS</Text>
            <Text style={[styles.summaryValue, { color: classColor }]}>{reportData.lsc}</Text>
            <Text style={styles.summarySubtext}>{reportData.fullClassification.split('-')[1]?.trim() || reportData.fullClassification}</Text>
          </View>

          <View style={[styles.summaryItem, { width: '100%', marginTop: 16 }]}>
            <Text style={styles.summaryLabel}>LIMITING FACTORS</Text>
            <Text style={styles.summaryValueText}>{decodedFactors}</Text>
          </View>

        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="info" size={20} color="#0F172A" />
          <Text style={styles.cardTitle}>Interpretation</Text>
        </View>
        <Text style={styles.bodyText}>
          {reportData.lsc === 'S1' 
            ? `The land is highly suitable for ${reportData.cropId}. Soil conditions and climate parameters align perfectly with the crop's optimal growth requirements.`
            : `The land has some limitations for ${reportData.cropId}. Please review the limiting factors above and apply the recommended agricultural interventions to improve yield.`}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="check-square" size={20} color="#0F172A" />
          <Text style={styles.cardTitle}>Recommendations</Text>
        </View>
        
        {recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationRow}>
            <View style={styles.recommendationNumber}>
              <Text style={styles.recommendationNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionContainer}>
        {/* Clears the report by removing the ID from the URL parameters */}
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={() => router.setParams({ id: '' })}>
          <Text style={styles.secondaryButtonText}>Clear Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
          <Feather name="share" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Export PDF</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 120 },
  
  // --- Empty State Styles ---
  emptyContainer: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIconBox: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  emptySubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  
  // FIXED: Added alignSelf: 'center' to prevent the button from stretching to the edges
  emptyButton: { 
    backgroundColor: '#2d5a2e', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 30,
    alignSelf: 'center' 
  },
  emptyButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },

  // --- Populated State Styles ---
  header: { marginBottom: 24 },
  datePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eaf4ea', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
  dateText: { color: '#5a9d5e', fontSize: 13, fontWeight: '700', marginLeft: 6, letterSpacing: 0.5 },
  headerTitle: { fontSize: 36, fontWeight: '700', color: '#0F172A', letterSpacing: -1.5 },
  headerSubtitle: { fontSize: 18, color: '#64748B', marginTop: 4, fontStyle: 'italic' },
  
  card: { backgroundColor: '#F8FAFC', borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 20, letterSpacing: -0.3 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  summaryItem: { width: '48%', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, marginBottom: 4 },
  summaryValue: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  summaryValueText: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginTop: 4 },
  summarySubtext: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 4 },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginLeft: 8, letterSpacing: -0.3 },
  bodyText: { fontSize: 15, lineHeight: 24, color: '#475569' },
  
  recommendationRow: { flexDirection: 'row', marginBottom: 16, paddingRight: 16 },
  recommendationNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#5a9d5e', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  recommendationNumberText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  recommendationText: { flex: 1, fontSize: 15, lineHeight: 24, color: '#475569' },

  actionContainer: { marginTop: 16, flexDirection: 'row', gap: 12 },
  primaryButton: { flex: 1, backgroundColor: '#2d5a2e', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 30 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondaryButton: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 30 },
  secondaryButtonText: { color: '#64748B', fontSize: 16, fontWeight: '600' }
});