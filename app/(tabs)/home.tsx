import { Feather } from '@expo/vector-icons';
import { Database } from '@nozbe/watermelondb';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface HomeProps {
  cropsCount: number;
}

const HomeScreen = ({ cropsCount }: HomeProps) => {
  // Generates a clean, dynamic date string (e.g., "Monday, October 23")
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* 1. Google-Style Header with Date Pill */}
      <View style={styles.header}>
        <View style={styles.datePill}>
          <Feather name="calendar" size={14} color="#5a9d5e" />
          <Text style={styles.dateText}>{today}</Text>
        </View>
        <Text style={styles.headerTitle}>Overview</Text>
      </View>

      {/* 2. Material 3 Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.iconWrapper}>
            <Feather name="database" size={20} color="#5a9d5e" />
          </View>
          <Text style={styles.statValue}>{cropsCount}</Text>
          <Text style={styles.statLabel}>Crops Loaded</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.iconWrapper}>
            <Feather name="layers" size={20} color="#5a9d5e" />
          </View>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Soil Samples</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.iconWrapper}>
            <Feather name="activity" size={20} color="#5a9d5e" />
          </View>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Evaluations</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.iconWrapper}>
            <Feather name="check-circle" size={20} color="#5a9d5e" />
          </View>
          <Text style={styles.statValue}>0%</Text>
          <Text style={styles.statLabel}>Suitability</Text>
        </View>
      </View>

      {/* 3. System Status Card (Classic Google Info Card) */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Feather name="info" size={20} color="#0F172A" />
          <Text style={styles.infoCardTitle}>System Ready</Text>
        </View>
        <Text style={styles.infoCardText}>
          The SoilWise evaluation engine is updated and ready. Tap the + button below to start a new soil analysis.
        </Text>
      </View>

    </ScrollView>
  );
};

const enhance = withObservables([], ({ database }: { database: Database }) => ({
  cropsCount: database.collections.get('crops').query().observeCount(),
}));

export default withDatabase(enhance(HomeScreen));

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' // Clean off-white/grey background
  },
  scrollContent: { 
    padding: 24, 
    paddingTop: 60, 
    paddingBottom: 110 // Space for the floating tab bar
  },
  header: { 
    marginBottom: 32 
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4ea', // Pale green from settings
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20, // Pill shape
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dateText: { 
    color: '#5a9d5e', // Primary green
    fontSize: 13, 
    fontWeight: '700', 
    marginLeft: 6,
    letterSpacing: 0.5,
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
    borderRadius: 24, // Large Google Material 3 radius
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9', // Soft grey circular wrapper for the icon
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