import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { getProject, listProjects } from '../api/projects';
import { listTasksByProject } from '../api/tasks';
import { ApiFetchError } from '../api/client';
import type { MainTabParamList } from '../navigation/types';
import type { Task, TaskStatus } from '../types';
import { PRIORITY_LABEL, TASK_STATUS_LABEL, TASK_STATUS_ORDER, formatarDataCurta, iniciais } from '../utils/mappers';

export function TasksScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<MainTabParamList, 'Tarefas'>>();
  const paramProjectId = route.params?.projectId;

  const [activeTab, setActiveTab] = useState<TaskStatus>('A_FAZER');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    setCarregando(true);
    try {
      // Usa o projeto vindo por parâmetro; se não houver, cai para o primeiro projeto do usuário.
      let alvoId = paramProjectId ?? null;
      if (alvoId == null) {
        const projetos = await listProjects();
        if (projetos.length === 0) {
          setProjectId(null);
          setProjectName('');
          setTasks([]);
          return;
        }
        alvoId = projetos[0].id;
      }
      const [projeto, lista] = await Promise.all([getProject(alvoId), listTasksByProject(alvoId)]);
      setProjectId(alvoId);
      setProjectName(projeto.name);
      setTasks(lista);
    } catch (e) {
      setErro(e instanceof ApiFetchError ? e.message : 'Erro ao carregar tarefas.');
    } finally {
      setCarregando(false);
    }
  }, [paramProjectId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const tabs = TASK_STATUS_ORDER.map((status) => ({
    status,
    name: TASK_STATUS_LABEL[status],
    count: tasks.filter((t) => t.status === status).length,
  }));

  const visiveis = tasks.filter((t) => t.status === activeTab);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View style={styles.titleSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Projetos')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.subtitle}>{projectName || 'Projeto'}</Text>
            <Text style={styles.pageTitle}>Tarefas</Text>
          </View>
        </View>
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>Y</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => projectId != null && navigation.navigate('NewTask', { projectId })}
          >
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Abas de Status */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.status}
            style={[styles.tab, activeTab === tab.status && styles.activeTab]}
            onPress={() => setActiveTab(tab.status)}
          >
            <Text style={[styles.tabText, activeTab === tab.status && styles.activeTabText]}>{tab.name}</Text>
            <View style={[styles.badge, activeTab === tab.status && styles.activeBadge]}>
              <Text style={[styles.badgeText, activeTab === tab.status && styles.activeBadgeText]}>
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTaskCard = ({ item }: { item: Task }) => (
    <TouchableOpacity style={styles.taskCard} onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}>
      <View style={styles.cardTopRow}>
        <View style={styles.taskTitleRow}>
          <View style={styles.checkbox} />
          <Text style={styles.taskTitle}>{item.title}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{iniciais(item.assignee.name)}</Text>
        </View>
      </View>

      <View style={styles.cardBottomRow}>
        <View style={styles.dateRow}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.dateText}>{formatarDataCurta(item.dueDate)}</Text>
        </View>
        <View style={styles.priorityPill}>
          <Text style={styles.priorityText}>{PRIORITY_LABEL[item.priority]}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (carregando) {
      return <ActivityIndicator style={styles.stateBox} size="large" color="#0F172A" />;
    }
    if (erro) {
      return <Text style={[styles.stateBox, styles.errorText]}>{erro}</Text>;
    }
    if (projectId == null) {
      return <Text style={[styles.stateBox, styles.emptyText]}>Crie um projeto para adicionar tarefas.</Text>;
    }
    return <Text style={[styles.stateBox, styles.emptyText]}>Nenhuma tarefa nesta situação.</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={visiveis}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTaskCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
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
  priorityText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  stateBox: { marginTop: 40, textAlign: 'center' },
  errorText: { color: '#EF4444', fontSize: 14 },
  emptyText: { color: '#94A3B8', fontSize: 14 },
});
