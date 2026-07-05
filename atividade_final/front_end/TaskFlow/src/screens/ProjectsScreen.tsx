import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { listProjects } from '../api/projects';
import { ApiFetchError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Project } from '../types';
import { PROJECT_STATUS_LABEL, iniciais } from '../utils/mappers';

export function ProjectsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [projetos, setProjetos] = useState<Project[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setProjetos(await listProjects());
    } catch (e) {
      setErro(e instanceof ApiFetchError ? e.message : 'Erro ao carregar projetos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Recarrega ao focar a tela (reflete projetos recém-criados).
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  // Resumo derivado dos dados reais (antes era hardcoded).
  const total = projetos.length;
  const ativos = projetos.filter((p) => p.status === 'ATIVO').length;
  const concluidos = projetos.filter((p) => p.status === 'CONCLUIDO').length;

  const filtrados = projetos.filter((p) => p.name.toLowerCase().includes(busca.trim().toLowerCase()));

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name ?? ''} 👋</Text>
          <Text style={styles.pageTitle}>Meus Projetos</Text>
        </View>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.notificationBtn}>
            <Text>🔔</Text>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user ? iniciais(user.name) : ''}</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar projetos..."
          placeholderTextColor="#94A3B8"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{total}</Text>
          <Text style={styles.summaryText}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{ativos}</Text>
          <Text style={styles.summaryText}>Ativos</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{concluidos}</Text>
          <Text style={styles.summaryText}>Concluídos</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Todos os projetos</Text>
        <TouchableOpacity style={styles.newButton} onPress={() => navigation.navigate('NewProject')}>
          <Text style={styles.newButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProjectCard = ({ item }: { item: Project }) => {
    const statusLabel = PROJECT_STATUS_LABEL[item.status];
    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => navigation.navigate('Tarefas', { projectId: item.id })}
      >
        <View style={styles.cardTopRow}>
          <View>
            <Text style={styles.projectTitle}>{item.name}</Text>
            <Text style={styles.projectCategory}>{item.category ?? 'Sem categoria'}</Text>
          </View>
          <View style={[styles.statusPill, item.status === 'CONCLUIDO' && styles.statusPillDone]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progresso</Text>
            <Text style={styles.progressPercent}>{item.progressPercentage}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${item.progressPercentage}%` }]} />
          </View>
        </View>

        <View style={styles.cardBottomRow}>
          <Text style={styles.bottomText}>👥 {item.members.length} membros</Text>
          <Text style={styles.bottomText}>
            {item.completedTasks}/{item.totalTasks} tarefas
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (carregando) {
      return <ActivityIndicator style={styles.stateBox} size="large" color="#0F172A" />;
    }
    if (erro) {
      return <Text style={[styles.stateBox, styles.errorText]}>{erro}</Text>;
    }
    return <Text style={[styles.stateBox, styles.emptyText]}>Nenhum projeto ainda. Toque em “+ Novo”.</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filtrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProjectCard}
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
  bottomText: { fontSize: 12, color: '#64748B' },
  stateBox: { marginTop: 40, textAlign: 'center' },
  errorText: { color: '#EF4444', fontSize: 14 },
  emptyText: { color: '#94A3B8', fontSize: 14 },
});
