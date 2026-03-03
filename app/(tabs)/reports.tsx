import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReportsScreen() {
  const router = useRouter();
  
  // Toggle this state to see the Empty vs Populated views
  const [hasResults, setHasResults] = useState(true);

  // Mock data based on your Python evaluation output
  const mockResult = {
    crop_name: "Arabica Coffee",
    scientific_name: "Coffea arabica",
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    lsi: 82.50,
    lsc: "S1",
    full_classification: "Highly Suitable",
    limiting_factors: "None",
    interpretation: "The land is highly suitable for Arabica Coffee. Soil conditions and climate parameters align perfectly with the crop's optimal growth requirements.",
    recommendations: [
      "Maintain current organic matter levels with regular compost application.",
      "Monitor soil moisture during the dry season to prevent drought stress.",
      "Implement standard integrated pest management practices to protect yields."
    ]
  };

  const getClassificationColor = (lsc: string) => {
    switch (lsc) {
      case 'S1': return '#22c55e'; 
      case 'S2': return '#f59e0b'; 
      case 'S3': return '#f97316'; 
      case 'N': return '#ef4444';  
      default: return '#3d5a3f';
    }
  };

  if (!hasResults) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Feather name="file-text" size={48} color="#94A3B8" />
        </View>
        <Text style={styles.emptyTitle}>No Reports Available</Text>
        <Text style={styles.emptySubtitle}>
          Start evaluating crops to generate detailed suitability reports and recommendations.
        </Text>
        
        {/* FIXED: Using the new emptyButton style without flex: 1 */}
        <TouchableOpacity 
          style={styles.emptyButton} 
          activeOpacity={0.8}
          onPress={() => router.push('/input')}
        >
          <Text style={styles.primaryButtonText}>New Analysis</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const classColor = getClassificationColor(mockResult.lsc);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.datePill}>
          <Feather name="clock" size={14} color="#5a9d5e" />
          <Text style={styles.dateText}>{mockResult.date}</Text>
        </View>
        <Text style={styles.headerTitle}>Evaluation Report</Text>
        <Text style={styles.headerSubtitle}>{mockResult.crop_name} ({mockResult.scientific_name})</Text>
      </View>

      {/* 1. Summary Grid */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryGrid}>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>LSI SCORE</Text>
            <Text style={[styles.summaryValue, { color: classColor }]}>{mockResult.lsi}</Text>
            <Text style={styles.summarySubtext}>Out of 100</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>CLASS</Text>
            <Text style={[styles.summaryValue, { color: classColor }]}>{mockResult.lsc}</Text>
            <Text style={styles.summarySubtext}>{mockResult.full_classification}</Text>
          </View>

          <View style={[styles.summaryItem, { width: '100%', marginTop: 16 }]}>
            <Text style={styles.summaryLabel}>LIMITING FACTORS</Text>
            <Text style={styles.summaryValueText}>{mockResult.limiting_factors}</Text>
          </View>

        </View>
      </View>

      {/* 2. Interpretation */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="info" size={20} color="#0F172A" />
          <Text style={styles.cardTitle}>Interpretation</Text>
        </View>
        <Text style={styles.bodyText}>{mockResult.interpretation}</Text>
      </View>

      {/* 3. Recommendations */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="check-square" size={20} color="#0F172A" />
          <Text style={styles.cardTitle}>Recommendations</Text>
        </View>
        
        {mockResult.recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationRow}>
            <View style={styles.recommendationNumber}>
              <Text style={styles.recommendationNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={() => setHasResults(false)}>
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
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  scrollContent: { 
    padding: 24, 
    paddingTop: 80, 
    paddingBottom: 120 
  },
  
  // --- Empty State Styles ---
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  // FIXED: New style specifically for the empty state button
  emptyButton: {
    backgroundColor: '#2d5a2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32, // Gives it the nice pill shape width
    borderRadius: 30,
  },

  // --- Populated State Styles ---
  header: { 
    marginBottom: 24 
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4ea',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dateText: { 
    color: '#5a9d5e', 
    fontSize: 13, 
    fontWeight: '700', 
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  headerTitle: { 
    fontSize: 36, 
    fontWeight: '700', 
    color: '#0F172A', 
    letterSpacing: -1.5 
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  summaryValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 4,
  },
  summarySubtext: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  
  recommendationRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingRight: 16,
  },
  recommendationNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5a9d5e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  recommendationNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },

  actionContainer: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1, // Notice how flex: 1 is kept here so it shares width with the secondary button
    backgroundColor: '#2d5a2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
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