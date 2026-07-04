import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Estrutura de dados pronta para o seu parceiro do back-end consumir da API depois
const MOCK_TASKS = [
  { id: '1', title: 'Implementar tela de login', date: '18 Jun', assignee: 'AS', priority: 'Alta', status: 'Em andamento' },
  { id: '2', title: 'Integração com API de autenticação', date: '19 Jun', assignee: 'LC', priority: 'Alta', status: 'Em andamento' },
];

export function TasksScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('Em andamento');

  const tabs = [
    { name: 'A fazer', count: 3 },
    { name: 'Em andamento', count: 2 },
    { name: 'Concluída', count: 2 },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View style={styles.titleSection}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.subtitle}>Redesign do Site</Text>
            <Text style={styles.pageTitle}>Tarefas</Text>
          </View>
        </View>
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>Y</Text> 
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Abas de Status */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity 
            key={tab.name} 
            style={[styles.tab, activeTab === tab.name && styles.activeTab]}
            onPress={() => setActiveTab(tab.name)}
          >
            <Text style={[styles.tabText, activeTab === tab.name && styles.activeTabText]}>
              {tab.name}
            </Text>
            <View style={[styles.badge, activeTab === tab.name && styles.activeBadge]}>
              <Text style={[styles.badgeText, activeTab === tab.name && styles.activeBadgeText]}>
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTaskCard = ({ item }: { item: typeof MOCK_TASKS[0] }) => (
    // Quando clicarmos na tarefa, iremos para a tela de Detalhes (Próximo passo)
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetails')}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.taskTitleRow}>
          <View style={styles.checkbox} />
          <Text style={styles.taskTitle}>{item.title}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.assignee}</Text>
        </View>
      </View>

      <View style={styles.cardBottomRow}>
        <View style={styles.dateRow}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <View style={styles.priorityPill}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={MOCK_TASKS}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskCard}
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
  titleSection: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16 },
  backIcon: { fontSize: 24, color: '#64748B' },
  subtitle: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  actionsSection: { flexDirection: 'row', alignItems: 'center' },
  filterButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  filterIcon: { color: '#64748B', fontSize: 16 },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  addIcon: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginTop: -2 },
  
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 12 },
  tab: { flexDirection: 'row', alignItems: 'center', marginRight: 24, paddingBottom: 12, marginBottom: -13 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#0F172A' },
  tabText: { fontSize: 14, color: '#94A3B8', fontWeight: '500', marginRight: 6 },
  activeTabText: { color: '#0F172A', fontWeight: 'bold' },
  badge: { backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 },
  activeBadge: { backgroundColor: '#0F172A' },
  badgeText: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold' },
  activeBadgeText: { color: '#FFFFFF' },

  taskCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  taskTitleRow: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, paddingRight: 12 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#CBD5E1', borderRadius: 4, marginRight: 12, marginTop: 2 },
  taskTitle: { fontSize: 16, fontWeight: '500', color: '#0F172A', flex: 1 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#475569', fontWeight: 'bold', fontSize: 12 },
  
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 32 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  calendarIcon: { fontSize: 12, marginRight: 6 },
  dateText: { fontSize: 12, color: '#64748B' },
  priorityPill: { backgroundColor: '#F1F5F9', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  priorityText: { fontSize: 12, color: '#475569', fontWeight: '500' }
});