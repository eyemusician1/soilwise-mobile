import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- MOCK DATA ---
const INITIAL_HISTORY = [
  { id: "eval_001", date: "Dec 26, 2025", cropname: "Cabbage", lsi: 78.5, lsc: "S2" },
  { id: "eval_002", date: "Dec 25, 2025", cropname: "Banana", lsi: 92.3, lsc: "S1" },
  { id: "eval_003", date: "Dec 24, 2025", cropname: "Arabica Coffee", lsi: 45.2, lsc: "N" },
  { id: "eval_004", date: "Dec 22, 2025", cropname: "Banana", lsi: 85.0, lsc: "S1" },
];

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [historyData, setHistoryData] = useState(INITIAL_HISTORY);

  // Filter Logic
  const filteredData = historyData.filter(item => {
    const matchesSearch = item.cropname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.lsc.startsWith(activeFilter);
    return matchesSearch && matchesFilter;
  });

  // Dynamic LSI Colors for quick scanning
  const getLsiColor = (lsi: number) => {
    if (lsi >= 80) return '#22c55e'; // Bright Green for S1
    if (lsi >= 60) return '#f59e0b'; // Amber for S2/S3
    return '#ef4444'; // Red for N
  };

  return (
    <View style={styles.container}>
      
      {/* Header WITH Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>

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

        {/* Filter Pills with Green Active State */}
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
            <Text style={styles.emptyTitle}>No evaluations found</Text>
          </View>
        ) : (
          filteredData.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              
              {/* Left: Green Accent Icon */}
              <View style={styles.cardIconBox}>
                <Feather name="file-text" size={20} color="#5a9d5e" />
              </View>

              {/* Middle: Essential Details */}
              <View style={styles.cardDetails}>
                <Text style={styles.cropName}>{item.cropname}</Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              {/* Right: Scores */}
              <View style={styles.cardScores}>
                <Text style={[styles.lsiScore, { color: getLsiColor(item.lsi) }]}>
                  {item.lsi.toFixed(1)}
                </Text>
                <View style={styles.classPill}>
                  <Text style={styles.classPillText}>{item.lsc}</Text>
                </View>
              </View>

            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Clean white background
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80, 
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -1.5,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#2d5a2e', // Deep Agritech green for active state
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120, 
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eaf4ea', // Soft green wrapper
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardDetails: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardScores: {
    alignItems: 'flex-end',
  },
  lsiScore: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  classPill: {
    marginTop: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  classPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eaf4ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});