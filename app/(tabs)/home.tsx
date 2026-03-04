import { Feather } from '@expo/vector-icons';
import { Database } from '@nozbe/watermelondb';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

import Evaluation from '../../src/database/models/Evaluation';

const { width } = Dimensions.get('window');

interface HomeProps {
  cropsCount: number;
  evaluations: Evaluation[]; 
}

const HomeScreen = ({ cropsCount, evaluations }: HomeProps) => {
  
  // --- CALCULATE LIVE ANALYTICS ---
  const evalCount = evaluations.length;
  
  // Count how many evaluations resulted in Highly (S1) or Moderately (S2) Suitable
  const suitableCount = evaluations.filter(e => e.lsc === 'S1').length;
  
  // Calculate Average LSI Score across all evaluations
  const totalLsi = evaluations.reduce((sum, e) => sum + e.lsi, 0);
  const avgLsi = evalCount > 0 ? Math.round(totalLsi / evalCount) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Overview</Text>
      </View>

      {/* 2. Live Stats Grid */}
      <View style={styles.statsGrid}>
        
        <View style={styles.statCard}>
          <View style={styles.iconWrapper}>
            <Feather name="database" size={20} color="#5a9d5e" />
          </View>
          <Text style={styles.statValue}>{cropsCount}</Text>
          <Text style={styles.statLabel}>Crops Loaded</Text>
        </View>

        {/* UPDATED: Changed to Reports Generated */}
        <View style={styles.statCard}>
          <View style={styles.iconWrapper}>
            <Feather name="file-text" size={20} color="#5a9d5e" />
          </View>
          <Text style={styles.statValue}>{evalCount}</Text>
          <Text style={styles.statLabel}>Reports Generated</Text>
        </View>

        {/* UPDATED: Shifted Suitable Fits here */}
        <View style={styles.statCard}>
          <View style={styles.iconWrapper}>
            <Feather name="check-circle" size={20} color="#5a9d5e" />
          </View>
          <Text style={styles.statValue}>{suitableCount}</Text>
          <Text style={styles.statLabel}>Most Suitable (S1)</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.iconWrapper}>
            <Feather name="activity" size={20} color="#5a9d5e" />
          </View>
          <Text style={styles.statValue}>{avgLsi}%</Text>
          <Text style={styles.statLabel}>Avg Suitability (LSI)</Text>
        </View>

      </View>

      {/* 3. System Status Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Feather name="info" size={20} color="#0F172A" />
          <Text style={styles.infoCardTitle}>System Ready</Text>
        </View>
        <Text style={styles.infoCardText}>
          The SoilWise evaluation engine is updated and ready. Tap the input button below to start a new soil analysis.
        </Text>
      </View>

    </ScrollView>
  );
};

// Tell WatermelonDB to listen to the evaluation_results table and pass the data down
const enhance = withObservables([], ({ database }: { database: Database }) => ({
  cropsCount: database.collections.get('crops').query().observeCount(),
  evaluations: database.collections.get<Evaluation>('evaluation_results').query().observe(),
}));

export default withDatabase(enhance(HomeScreen));

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  scrollContent: { 
    padding: 24, 
    paddingTop: 60, 
    paddingBottom: 110 
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
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  statCard: {
    width: (width - 48 - 16) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 24, 
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#0F172A', 
    letterSpacing: -0.5, 
    marginBottom: 4 
  },
  statLabel: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#64748B' 
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 24,
  }
});