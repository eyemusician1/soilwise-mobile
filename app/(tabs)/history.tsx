import { Feather } from '@expo/vector-icons';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { database } from '../../src/database';
import Evaluation from '../../src/database/models/Evaluation';

const HistoryScreen = ({ evaluations }: { evaluations: Evaluation[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Evaluation | null>(null);

  // OPTIMIZATION: useMemo prevents the app from recalculating the filter
  // on every minor screen render. It only recalculates if evaluations, search, or filter changes.
  const filteredData = useMemo(() => {
    return evaluations.filter(item => {
      const matchesSearch = item.cropId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || item.lsc.startsWith(activeFilter);
      return matchesSearch && matchesFilter;
    });
  }, [evaluations, searchQuery, activeFilter]);

  const getLsiColor = (lsi: number) => {
    if (lsi >= 80) return '#22c55e'; 
    if (lsi >= 60) return '#f59e0b'; 
    return '#ef4444'; 
  };

  const getClassColor = (lsc: string) => {
    switch (lsc) {
      case 'S1': return '#22c55e';
      case 'S2': return '#f59e0b';
      case 'S3': return '#f97316';
      case 'N':  return '#ef4444';
      default:   return '#64748B';
    }
  };

  const getShortInterpretation = (lsc: string, cropId: string) => {
    switch (lsc) {
      case 'S1': return `${cropId} is highly suitable. Soil and climate conditions are optimal.`;
      case 'S2': return `${cropId} is moderately suitable. Minor limitations may reduce yield.`;
      case 'S3': return `${cropId} is marginally suitable. Significant limitations require attention.`;
      case 'N':  return `${cropId} is currently not suitable. Land improvements are needed.`;
      default:   return 'No interpretation available.';
    }
  };

  const getTopRecommendation = (lsc: string, factors: string | null) => {
    if (lsc === 'S1') return 'Maintain current soil management practices to sustain optimal conditions.';
    const f = factors?.toLowerCase() || '';
    if (f.includes('t')) return 'Construct terraces or contour bounds to manage slope and prevent erosion.';
    if (f.includes('f')) return 'Apply NPK fertilizers and organic compost to correct soil fertility and pH.';
    if (f.includes('w')) return 'Improve drainage systems to prevent waterlogging during wet season.';
    if (f.includes('s')) return 'Incorporate organic matter to improve soil texture and root penetration.';
    return 'Consult a local agricultural extension officer for targeted interventions.';
  };

  const decodeLimitingFactors = (factors: string | null) => {
    if (!factors || factors === 'None') return 'None';
    const codes: Record<string, string> = {
      'c': 'Climate', 't': 'Topography', 'w': 'Wetness',
      's': 'Physical Soil', 'f': 'Soil Fertility', 'n': 'Salinity'
    };
    return factors.split(',').map(f => codes[f.trim().toLowerCase()] || f.trim().toUpperCase()).join(', ');
  };

  const deleteEvaluation = (evaluationRecord: Evaluation) => {
    setDeleteTarget(evaluationRecord);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await database.write(async () => {
        await deleteTarget.destroyPermanently();
      });
    } catch (error) {
      // silently fail — record may already be gone
    } finally {
      setDeleteTarget(null);
    }
  };

  const SCIENTIFIC_NAMES: Record<string, string> = {
    'Arabica Coffee':  'Coffea arabica',
    'Robusta Coffee':  'Coffea canephora',
    'Banana':          'Musa acuminata',
    'Cabbage':         'Brassica oleracea',
    'Carrots':         'Daucus carota',
    'Cocoa':           'Theobroma cacao',
    'Maize':           'Zea mays',
    'Oil Palm':        'Elaeis guineensis',
    'Pineapple':       'Ananas comosus',
    'Sorghum':         'Sorghum bicolor',
    'Sugarcane':       'Saccharum officinarum',
    'Sweet Potato':    'Ipomoea batatas',
    'Tomato':          'Solanum lycopersicum',
  };

  const renderHistoryCard = useCallback(({ item }: { item: Evaluation }) => {
    const isExpanded = expandedId === item.id;
    const classColor = getClassColor(item.lsc);
    const scientificName = SCIENTIFIC_NAMES[item.cropId] || '';

    return (
      <View style={styles.cardWrapper}>
        {/* Main Row */}
        <TouchableOpacity
          style={styles.historyCard}
          activeOpacity={0.7}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <View style={styles.cardIconBox}>
            <Feather name="file-text" size={20} color="#5a9d5e" />
          </View>

          <View style={styles.cardDetails}>
            <Text style={styles.cropName}>{item.cropId}</Text>
            <Text style={styles.scientificName}>{scientificName}</Text>
          </View>

          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#94A3B8"
            style={{ marginLeft: 8 }}
          />

          <TouchableOpacity style={styles.deleteButton} onPress={() => deleteEvaluation(item)}>
            <Feather name="trash-2" size={16} color="#ef4444" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Expandable Dropdown */}
        {isExpanded && (
          <View style={styles.dropdownPanel}>

            {/* Date */}
            <View style={styles.dropdownDateRow}>
              <Feather name="clock" size={12} color="#94A3B8" style={{ marginRight: 5 }} />
              <Text style={styles.dropdownDate}>
                {item.createdAt
                  ? item.createdAt.toLocaleString('en-US', {
                      timeZone: 'Asia/Manila',
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })
                  : 'Just now'}
              </Text>
            </View>

            {/* Row 1: LSI value + Classification tag side by side */}
            <View style={styles.dropdownTopRow}>
              <View style={styles.lsiBlock}>
                <Text style={styles.dropdownLabel}>LSI Score</Text>
                <Text style={[styles.lsiValue, { color: getLsiColor(item.lsi) }]}>{item.lsi.toFixed(1)}</Text>
              </View>
              <View style={[styles.classTag, { backgroundColor: classColor + '18', borderColor: classColor + '50' }]}>
                <Text style={[styles.classTagText, { color: classColor }]}>{item.fullClassification}</Text>
              </View>
            </View>

            {/* Row 2: Limiting factors + Interpretation in two clean blocks */}
            <View style={styles.dropdownInfoRow}>
              <View style={styles.infoBlock}>
                <Text style={styles.dropdownLabel}>Limiting Factors</Text>
                <Text style={styles.dropdownValue}>{decodeLimitingFactors(item.limitingFactors)}</Text>
              </View>
            </View>

            <View style={styles.dropdownInfoRow}>
              <View style={styles.infoBlock}>
                <Text style={styles.dropdownLabel}>Interpretation</Text>
                <Text style={styles.dropdownValue}>{getShortInterpretation(item.lsc, item.cropId)}</Text>
              </View>
            </View>

            {/* Row 3: Recommendation highlight */}
            <View style={styles.recommendationBox}>
              <Feather name="check-circle" size={13} color="#5a9d5e" style={{ marginRight: 6, marginTop: 1 }} />
              <Text style={styles.recommendationText}>{getTopRecommendation(item.lsc, item.limitingFactors)}</Text>
            </View>

          </View>
        )}
      </View>
    );
  }, [expandedId]);

  return (
    <>
      <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>History</Text>
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

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryCard}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        extraData={expandedId}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Feather name="inbox" size={32} color="#5a9d5e" />
            </View>
            <Text style={styles.emptyTitle}>No evaluations yet</Text>
            <Text style={styles.emptySubtitle}>Run an analysis on the Input page to see it here.</Text>
          </View>
        }
      />
    </View>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal
        visible={deleteTarget !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDeleteTarget(null)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalIconBox}>
              <Feather name="trash-2" size={24} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Delete Evaluation</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to permanently delete the{' '}
              <Text style={{ fontWeight: '700', color: '#0F172A' }}>{deleteTarget?.cropId}</Text>
              {' '}evaluation? This action cannot be undone.
            </Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalButton} activeOpacity={0.8} onPress={() => setDeleteTarget(null)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonDestructive} activeOpacity={0.8} onPress={confirmDelete}>
                <Text style={styles.modalButtonTextDestructive}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// OPTIMIZATION: Database-level sorting
const enhance = withObservables([], () => ({
  evaluations: database.collections
    .get<Evaluation>('evaluation_results')
    .query(
      Q.sortBy('created_at', Q.desc) // Sorts newest-first efficiently via SQLite C++ backend
    )
    .observe(),
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
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: 16, paddingHorizontal: 16, height: 52, marginBottom: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 15, color: '#0F172A' },
  filterScroll: { flexGrow: 0 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  filterChipActive: { backgroundColor: '#2d5a2e' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterChipTextActive: { color: '#ffffff' },
  scrollContent: { padding: 24, paddingBottom: 120 },

  // Card
  cardWrapper: {
    marginBottom: 12, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0',
    backgroundColor: '#ffffff', overflow: 'hidden',
  },
  historyCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
  },
  cardIconBox: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#eaf4ea',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  cardDetails: { flex: 1 },
  cropName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  scientificName: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic', fontWeight: '400' },
  deleteButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#fef2f2',
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
    borderWidth: 1, borderColor: '#fecaca',
  },

  // Dropdown Panel
  dropdownPanel: {
    paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFCFA', gap: 12,
  },
  dropdownDateRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 4,
  },
  dropdownDate: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  dropdownTopRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  lsiBlock: { flex: 1 },
  lsiValue: { fontSize: 28, fontWeight: '800', letterSpacing: -1, marginTop: 2 },
  classTag: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1,
  },
  classTagText: { fontSize: 12, fontWeight: '700' },
  dropdownInfoRow: {},
  infoBlock: {},
  dropdownLabel: {
    fontSize: 10, fontWeight: '700', color: '#94A3B8',
    letterSpacing: 0.8, marginBottom: 3, textTransform: 'uppercase',
  },
  dropdownValue: { fontSize: 13, color: '#475569', lineHeight: 19 },
  recommendationBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#eaf4ea', borderRadius: 10, padding: 10,
  },
  recommendationText: {
    flex: 1, fontSize: 13, color: '#2d5a2e', lineHeight: 19, fontWeight: '500',
  },

  // Empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyIconBox: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#eaf4ea',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 32 },

  // Delete Confirmation Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff', width: '100%', borderRadius: 28, padding: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 10,
  },
  modalIconBox: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#fef2f2',
    borderWidth: 1, borderColor: '#fecaca',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, marginBottom: 8 },
  modalBody: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 32 },
  modalActionRow: { flexDirection: 'row', gap: 12 },
  modalButton: {
    flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 14,
    paddingHorizontal: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  modalButtonDestructive: {
    flex: 1, backgroundColor: '#fef2f2', paddingVertical: 14,
    paddingHorizontal: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#fecaca',
  },
  modalButtonText: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  modalButtonTextDestructive: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
});