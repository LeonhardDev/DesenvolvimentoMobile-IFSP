import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Bom dia, Ana Silva 👋</Text>
          <Text style={styles.pageTitle}>Visão Geral</Text>
        </View>

        {/* Cards de Resumo Rápido */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Tarefas para hoje</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚠️</Text>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Tarefa em atraso</Text>
          </View>
        </View>

        {/* Seção de Atividades Recentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividades Recentes</Text>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIconContainer}>
              <Text style={styles.activityIcon}>✅</Text>
            </View>
            <View style={styles.activityTextContainer}>
              <Text style={styles.activityTitle}>"Migração de Dados" concluída</Text>
              <Text style={styles.activityTime}>Há 2 horas</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIconContainer}>
              <Text style={styles.activityIcon}>💬</Text>
            </View>
            <View style={styles.activityTextContainer}>
              <Text style={styles.activityTitle}>Marco comentou em "Lançamento do App"</Text>
              <Text style={styles.activityTime}>Há 4 horas</Text>
            </View>
          </View>

        </View>
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
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginHorizontal: 6, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  statIcon: { fontSize: 24, marginBottom: 12 },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B' },

  section: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  activityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  activityIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  activityIcon: { fontSize: 16 },
  activityTextContainer: { flex: 1 },
  activityTitle: { fontSize: 14, color: '#0F172A', fontWeight: '500', marginBottom: 4 },
  activityTime: { fontSize: 12, color: '#94A3B8' }
});