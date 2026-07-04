import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';

// Dados falsos para testarmos o visual
const MOCK_PROJECTS = [
  { id: '1', title: 'Redesign do Site', category: 'Design & Dev', status: 'Em andamento', progress: 58, members: 4, tasks: '7/12' },
  { id: '2', title: 'Lançamento do App', category: 'Produto', status: 'Em andamento', progress: 55, members: 6, tasks: '11/20' },
  { id: '3', title: 'Migração de Dados', category: 'Engenharia', status: 'Concluído', progress: 100, members: 3, tasks: '15/15' },
];

export function ProjectsScreen() {
  // Cabeçalho e Resumo da tela (Fica no topo da lista)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Olá, Ana Silva 👋</Text>
          <Text style={styles.pageTitle}>Meus Projetos</Text>
        </View>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.notificationBtn}>
            <Text>🔔</Text>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Buscar projetos..." 
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>4</Text>
          <Text style={styles.summaryText}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>2</Text>
          <Text style={styles.summaryText}>Ativos</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>1</Text>
          <Text style={styles.summaryText}>Concluídos</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Todos os projetos</Text>
        <TouchableOpacity style={styles.newButton}>
          <Text style={styles.newButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Como cada projeto será desenhado
  const renderProjectCard = ({ item }: { item: typeof MOCK_PROJECTS[0] }) => (
    <TouchableOpacity style={styles.projectCard}>
      <View style={styles.cardTopRow}>
        <View>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectCategory}>{item.category}</Text>
        </View>
        <View style={[styles.statusPill, item.status === 'Concluído' && styles.statusPillDone]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Progresso</Text>
          <Text style={styles.progressPercent}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
        </View>
      </View>

      <View style={styles.cardBottomRow}>
        <Text style={styles.bottomText}>👥 {item.members} membros</Text>
        <Text style={styles.bottomText}>{item.tasks} tarefas</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={MOCK_PROJECTS}
        keyExtractor={(item) => item.id}
        renderItem={renderProjectCard}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  listContent: { padding: 24, paddingBottom: 100 },
  headerContainer: { marginBottom: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 14, color: '#64748B', marginBottom: 4 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  notificationBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, height: 50, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  searchIcon: { marginRight: 8, fontSize: 16 },
  searchInput: { flex: 1, fontSize: 16, color: '#0F172A' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  summaryCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, alignItems: 'center', marginHorizontal: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  summaryNumber: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  summaryText: { fontSize: 12, color: '#64748B' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  newButton: { backgroundColor: '#0F172A', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  newButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  projectCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  projectTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  projectCategory: { fontSize: 12, color: '#64748B' },
  statusPill: { backgroundColor: '#F1F5F9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  statusPillDone: { backgroundColor: '#E2E8F0' },
  statusText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  progressSection: { marginBottom: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, color: '#64748B' },
  progressPercent: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  progressBarBackground: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#0F172A', borderRadius: 3 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bottomText: { fontSize: 12, color: '#64748B' }
});