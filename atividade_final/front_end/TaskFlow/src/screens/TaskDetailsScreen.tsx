import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { getProject } from '../api/projects';
import { getTask, updateTaskStatus } from '../api/tasks';
import { ApiFetchError } from '../api/client';
import type { RootStackParamList } from '../navigation/types';
import type { Task, TaskStatus } from '../types';
import {
  PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
  formatarDataLonga,
  iniciais,
} from '../utils/mappers';

export function TaskDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetails'>>();
  const { taskId } = route.params;

  const [task, setTask] = useState<Task | null>(null);
  const [projectName, setProjectName] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const t = await getTask(taskId);
      setTask(t);
      try {
        setProjectName((await getProject(t.projectId)).name);
      } catch {
        setProjectName('');
      }
    } catch (e) {
      setErro(e instanceof ApiFetchError ? e.message : 'Erro ao carregar a tarefa.');
    } finally {
      setCarregando(false);
    }
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const alterarStatus = async (novo: TaskStatus) => {
    if (!task) return;
    setSalvando(true);
    try {
      const atualizada = await updateTaskStatus(task.id, novo);
      setTask(atualizada);
      setModalVisivel(false);
    } catch (e) {
      setErro(e instanceof ApiFetchError ? e.message : 'Erro ao atualizar o status.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color="#0F172A" />
      </SafeAreaView>
    );
  }

  if (erro || !task) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text style={styles.errorText}>{erro ?? 'Tarefa não encontrada.'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabeçalho Fixo */}
      <View style={styles.topBar}>
        <View style={styles.titleSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Detalhe da Tarefa</Text>
        </View>
      </View>

      {/* Conteúdo Rolável */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card Principal de Informações */}
        <View style={styles.card}>
          <View style={styles.tagsRow}>
            {!!projectName && (
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{projectName}</Text>
              </View>
            )}
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>{PRIORITY_LABEL[task.priority]} prioridade</Text>
            </View>
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText}>Prazo: {formatarDataLonga(task.dueDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🕒</Text>
              <Text style={styles.metaText}>
                Estimativa: {task.estimatedHours != null ? `${task.estimatedHours}h` : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Card de Descrição */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>{task.description || 'Sem descrição.'}</Text>
        </View>

        {/* Card de Membros da Equipe */}
        <View style={styles.card}>
          <View style={styles.teamHeader}>
            <Text style={styles.sectionTitle}>Membros da equipe</Text>
            <TouchableOpacity style={styles.addMemberButton}>
              <Text style={styles.addMemberIcon}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Responsável */}
          <View style={styles.memberRow}>
            <View style={styles.memberInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{iniciais(task.assignee.name)}</Text>
              </View>
              <View>
                <Text style={styles.memberName}>{task.assignee.name}</Text>
                <Text style={styles.memberRole}>Responsável</Text>
              </View>
            </View>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          </View>

          {/* Colaboradores */}
          {task.collaborators.map((c) => (
            <View key={c.id} style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <View style={styles.avatarSecondary}>
                  <Text style={styles.avatarTextSecondary}>{iniciais(c.name)}</Text>
                </View>
                <View>
                  <Text style={styles.memberName}>{c.name}</Text>
                  <Text style={styles.memberRole}>Colaborador</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Botão de Ação Inferior Fixo */}
      <View style={styles.bottomBarContainer}>
        <TouchableOpacity style={styles.statusButton} onPress={() => setModalVisivel(true)}>
          <View style={styles.statusButtonLeft}>
            <View style={styles.statusDot} />
            <Text style={styles.statusButtonText}>Atualizar Status</Text>
          </View>
          <View style={styles.statusButtonRight}>
            <Text style={styles.statusCurrentText}>{TASK_STATUS_LABEL[task.status]}</Text>
            <Text style={styles.statusChevron}>⌄</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Seletor de status */}
      <Modal visible={modalVisivel} transparent animationType="fade" onRequestClose={() => setModalVisivel(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisivel(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Atualizar Status</Text>
            {TASK_STATUS_ORDER.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.modalOption, task.status === status && styles.modalOptionActive]}
                onPress={() => alterarStatus(status)}
                disabled={salvando}
              >
                <Text style={[styles.modalOptionText, task.status === status && styles.modalOptionTextActive]}>
                  {TASK_STATUS_LABEL[status]}
                </Text>
                {task.status === status && <Text style={styles.modalCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
            {salvando && <ActivityIndicator style={{ marginTop: 8 }} color="#0F172A" />}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#F8FAFC' },
  titleSection: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  backIcon: { fontSize: 20, color: '#64748B' },
  pageTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },

  scrollContent: { padding: 24, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  tagsRow: { flexDirection: 'row', marginBottom: 16 },
  tagPill: { backgroundColor: '#F1F5F9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, marginRight: 8 },
  tagText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  taskTitle: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  metaIcon: { fontSize: 14, marginRight: 6 },
  metaText: { fontSize: 12, color: '#64748B' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  descriptionText: { fontSize: 14, color: '#475569', lineHeight: 22 },

  teamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addMemberButton: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  addMemberIcon: { fontSize: 18, color: '#94A3B8' },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  memberInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#475569', fontWeight: 'bold', fontSize: 14 },
  avatarSecondary: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarTextSecondary: { color: '#94A3B8', fontWeight: 'bold', fontSize: 14 },
  memberName: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  memberRole: { fontSize: 12, color: '#64748B' },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  checkIcon: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },

  bottomBarContainer: { padding: 24, backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  statusButton: { backgroundColor: '#0F172A', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16 },
  statusButtonLeft: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#94A3B8', marginRight: 12 },
  statusButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  statusButtonRight: { flexDirection: 'row', alignItems: 'center' },
  statusCurrentText: { color: '#94A3B8', fontSize: 14, marginRight: 8 },
  statusChevron: { color: '#94A3B8', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8, backgroundColor: '#F8FAFC' },
  modalOptionActive: { backgroundColor: '#0F172A' },
  modalOptionText: { fontSize: 16, color: '#0F172A', fontWeight: '500' },
  modalOptionTextActive: { color: '#FFFFFF' },
  modalCheck: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
