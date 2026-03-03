import { Feather } from '@expo/vector-icons';
import withObservables from '@nozbe/with-observables';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// IMPORT YOUR DATABASE (Make sure this path points to your index.ts location!)
import { database } from '../../src/database';
import Evaluation from '../../src/database/models/Evaluation';

// The component now takes `evaluations` as a live prop directly from WatermelonDB
const HistoryScreen = ({ evaluations }: { evaluations: Evaluation[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Filter Logic on the live database objects
  const filteredData = evaluations.filter(item => {
    const matchesSearch = item.cropId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.lsc.startsWith(activeFilter);
    return matchesSearch && matchesFilter;
  });

  // Dynamic LSI Colors
  const getLsiColor = (lsi: number) => {
    if (lsi >= 80) return '#22c55e'; 
    if (lsi >= 60) return '#f59e0b'; 
    return '#ef4444'; 
  };

  // --- TEMPORARY DATABASE TESTER ---
  // Click the test button to write a random evaluation to the database
  const generateMockEvaluation = async () => {
    try {
      await database.write(async () => {
        await database.collections.get<Evaluation>('evaluation_results').create((evalRecord) => {
          const mockCrops = ['Arabica Coffee', 'Banana', 'Cabbage', 'Corn'];
          const randomCrop = mockCrops[Math.floor(Math.random() * mockCrops.length)];
          const randomLsi = Math.random() * (100 - 30) + 30; // Random score 30-100
          
          evalRecord.inputId = `test_${Date.now()}`;
          evalRecord.cropId = randomCrop;
          evalRecord.lsi = randomLsi;
          evalRecord.lsc = randomLsi >= 80 ? 'S1' : randomLsi >= 60 ? 'S2' : randomLsi >= 40 ? 'S3' : 'N';
          evalRecord.fullClassification = `${evalRecord.lsc} - Mock Classification`;
          evalRecord.limitingFactors = 'Topography';
          evalRecord.syncedToServer = false;
        });
      });
    } catch (error) {
      Alert.alert('Database Error', String(error));
    }
  };

  // Delete from database
  const deleteEvaluation = async (evaluationRecord: Evaluation) => {
    try {
      await database.write(async () => {
        await evaluationRecord.destroyPermanently();
      });
    } catch (error) {
      Alert.alert('Database Error', String(error));
    }
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>History</Text>
          
          {/* TEST BUTTON - REMOVE BEFORE PRODUCTION */}
          <TouchableOpacity style={styles.testButton} onPress={generateMockEvaluation}>
            <Feather name="plus" size={14} color="#ffffff" />
            <Text style={styles.testButtonText}>Test DB</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#5a9d5e" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search evaluations..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 8 }}>
          {['All', 'S1', 'S2', 'S3', 'N'].map((filter) => (
            <TouchableOpacity 
              key={filter} 
              activeOpacity={0.8}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* History List */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Feather name="inbox" size={32} color="#5a9d5e" />
            </View>
            <Text style={styles.emptyTitle}>No evaluations yet</Text>
            <Text style={styles.emptySubtitle}>Click "Test DB" above to try it out!</Text>
          </View>
        ) : (
          filteredData.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              
              <View style={styles.cardIconBox}>
                <Feather name="file-text" size={20} color="#5a9d5e" />
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.cropName}>{item.cropId}</Text>
                {/* Format the WatermelonDB date safely */}
                <Text style={styles.dateText}>
                  {item.createdAt ? item.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                </Text>
              </View>

              <View style={styles.cardScores}>
                <Text style={[styles.lsiScore, { color: getLsiColor(item.lsi) }]}>
                  {item.lsi.toFixed(1)}
                </Text>
                <View style={styles.classPill}>
                  <Text style={styles.classPillText}>{item.lsc}</Text>
                </View>
              </View>

              {/* Delete Button directly wired to DB row */}
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteEvaluation(item)}>
                <Feather name="trash-2" size={18} color="#94A3B8" />
              </TouchableOpacity>

            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

// -------------------------------------------------------------
// This is the Magic! WatermelonDB automatically feeds the database 
// updates into our component whenever a change occurs.
// -------------------------------------------------------------
const enhance = withObservables([], () => ({
  evaluations: database.collections
    .get<Evaluation>('evaluation_results')
    .query()
    .observe(), // Observes the database collection for any changes
}));

export default enhance(HistoryScreen);


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
  },
  headerTitle: { fontSize: 40, fontWeight: '700', color: '#0F172A', letterSpacing: -1.5 },
  testButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0ea5e9',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, gap: 6,
  },
  testButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: 16, paddingHorizontal: 16, height: 52, marginBottom: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 15, color: '#0F172A' },
  filterScroll: { flexGrow: 0 },
  filterChip: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9',
  },
  filterChipActive: { backgroundColor: '#2d5a2e' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterChipTextActive: { color: '#ffffff' },
  scrollContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24, paddingBottom: 120 },
  historyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0',
  },
  cardIconBox: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#eaf4ea',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  cardDetails: { flex: 1 },
  cropName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  dateText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  cardScores: { alignItems: 'flex-end', marginRight: 16 },
  lsiScore: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  classPill: { marginTop: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  classPillText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  deleteButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC',
    justifyContent: 'center', alignItems: 'center',
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyIconBox: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#eaf4ea',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#64748B' },
});