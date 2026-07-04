import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function TaskDetailsScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabeçalho Fixo */}
      <View style={styles.topBar}>
        <View style={styles.titleSection}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()} // Faz a seta voltar para a tela anterior
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Detalhe da Tarefa</Text>
        </View>
        <TouchableOpacity style={styles.attachmentButton}>
          <Text style={styles.attachmentIcon}>📎</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo Rolável */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Principal de Informações */}
        <View style={styles.card}>
          <View style={styles.tagsRow}>
            <View style={styles.tagPill}><Text style={styles.tagText}>Redesign do Site</Text></View>
            <View style={styles.tagPill}><Text style={styles.tagText}>Alta prioridade</Text></View>
          </View>
          
          <Text style={styles.taskTitle}>Implementar tela de login</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText}>Prazo: 18 Jun 2026</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🕒</Text>
              <Text style={styles.metaText}>Estimativa: 4h</Text>
            </View>
          </View>
        </View>

        {/* Card de Descrição */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>
            Desenvolver a tela de login conforme o protótipo aprovado. Deve incluir campos de e-mail e senha, validação de formulário, integração com a API de autenticação e tratamento de erros de credenciais inválidas. Seguir as diretrizes de acessibilidade definidas no Design System.
          </Text>
          
          <TouchableOpacity style={styles.attachmentPill}>
            <Text style={styles.attachmentPillIcon}>📎</Text>
            <Text style={styles.attachmentPillText}>protótipo-login-v2.fig</Text>
          </TouchableOpacity>
        </View>

        {/* Card de Membros da Equipe */}
        <View style={styles.card}>
          <View style={styles.teamHeader}>
            <Text style={styles.sectionTitle}>Membros da equipe</Text>
            <TouchableOpacity style={styles.addMemberButton}>
              <Text style={styles.addMemberIcon}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Membro 1 */}
          <View style={styles.memberRow}>
            <View style={styles.memberInfo}>
              <View style={styles.avatar}><Text style={styles.avatarText}>AS</Text></View>
              <View>
                <Text style={styles.memberName}>Ana Silva</Text>
                <Text style={styles.memberRole}>Responsável</Text>
              </View>
            </View>
            <View style={styles.checkCircle}><Text style={styles.checkIcon}>✓</Text></View>
          </View>

          {/* Membro 2 */}
          <View style={styles.memberRow}>
            <View style={styles.memberInfo}>
              <View style={styles.avatarSecondary}><Text style={styles.avatarTextSecondary}>MR</Text></View>
              <View>
                <Text style={styles.memberName}>Marco Reis</Text>
                <Text style={styles.memberRole}>Colaborador</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botão de Ação Inferior Fixo */}
      <View style={styles.bottomBarContainer}>
        <TouchableOpacity style={styles.statusButton}>
          <View style={styles.statusButtonLeft}>
            <View style={styles.statusDot} />
            <Text style={styles.statusButtonText}>Atualizar Status</Text>
          </View>
          <View style={styles.statusButtonRight}>
            <Text style={styles.statusCurrentText}>Em andamento</Text>
            <Text style={styles.statusChevron}>⌄</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#F8FAFC' },
  titleSection: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  backIcon: { fontSize: 20, color: '#64748B' },
  pageTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  attachmentButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  attachmentIcon: { fontSize: 16, color: '#64748B' },
  
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
  descriptionText: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 },
  attachmentPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  attachmentPillIcon: { fontSize: 16, marginRight: 8 },
  attachmentPillText: { fontSize: 14, color: '#64748B', fontWeight: '500' },

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
});