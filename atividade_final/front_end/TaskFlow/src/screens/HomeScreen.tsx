import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getActivities, getDashboardSummary } from '../api/dashboard';
import { ApiFetchError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Activity, DashboardSummary } from '../types';
import { iconeAtividade, tempoRelativo } from '../utils/mappers';

export function HomeScreen() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [atividades, setAtividades] = useState<Activity[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    setCarregando(true);
    try {
      const [resumo, feed] = await Promise.all([getDashboardSummary(), getActivities()]);
      setSummary(resumo);
      setAtividades(feed);
    } catch (e) {
      setErro(e instanceof ApiFetchError ? e.message : 'Erro ao carregar a visão geral.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Bom dia, {user?.name ?? ''} 👋</Text>
          <Text style={styles.pageTitle}>Visão Geral</Text>
        </View>

        {carregando ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#0F172A" />
        ) : erro ? (
          <Text style={styles.errorText}>{erro}</Text>
        ) : (
          <>
            {/* Cards de Resumo Rápido */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statNumber}>{summary?.tasksDueToday ?? 0}</Text>
                <Text style={styles.statLabel}>Tarefas para hoje</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>⚠️</Text>
                <Text style={styles.statNumber}>{summary?.overdueTasks ?? 0}</Text>
                <Text style={styles.statLabel}>Tarefas em atraso</Text>
              </View>
            </View>

            {/* Seção de Atividades Recentes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Atividades Recentes</Text>

              {atividades.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma atividade recente.</Text>
              ) : (
                atividades.map((a, idx) => (
                  <View key={`${a.timestamp}-${idx}`} style={styles.activityItem}>
                    <View style={styles.activityIconContainer}>
                      <Text style={styles.activityIcon}>{iconeAtividade(a.type)}</Text>
                    </View>
                    <View style={styles.activityTextContainer}>
                      <Text style={styles.activityTitle}>{a.message}</Text>
                      <Text style={styles.activityTime}>{tempoRelativo(a.timestamp)}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 24, paddingBottom: 100 },
  header: { marginBottom: 32 },
  greeting: { fontSize: 14, color: '#64748B', marginBottom: 4 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  errorText: { color: '#EF4444', fontSize: 14, marginTop: 40, textAlign: 'center' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginHorizontal: 6, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  statIcon: { fontSize: 24, marginBottom: 12 },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B' },

  section: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  emptyText: { fontSize: 14, color: '#94A3B8' },
  activityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  activityIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  activityIcon: { fontSize: 16 },
  activityTextContainer: { flex: 1 },
  activityTitle: { fontSize: 14, color: '#0F172A', fontWeight: '500', marginBottom: 4 },
  activityTime: { fontSize: 12, color: '#94A3B8' },
});
