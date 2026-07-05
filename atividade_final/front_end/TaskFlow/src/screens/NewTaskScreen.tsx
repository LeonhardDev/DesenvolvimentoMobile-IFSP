import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { getProject } from '../api/projects';
import { createTask } from '../api/tasks';
import { ApiFetchError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import type { Priority, UserSummary } from '../types';
import { PRIORITY_LABEL, PRIORITY_ORDER, iniciais } from '../utils/mappers';

export function NewTaskScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'NewTask'>>();
  const { projectId } = route.params;
  const { user } = useAuth();

  const [membros, setMembros] = useState<UserSummary[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIA');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [colaboradores, setColaboradores] = useState<number[]>([]);

  const [erro, setErro] = useState<string | null>(null);
  const [erroTitulo, setErroTitulo] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    // Responsável e colaboradores precisam ser membros do projeto (regra do backend).
    (async () => {
      try {
        const projeto = await getProject(projectId);
        setMembros(projeto.members);
        const eu = projeto.members.find((m) => m.id === user?.id);
        setAssigneeId(eu ? eu.id : (projeto.members[0]?.id ?? null));
      } catch (e) {
        setErro(e instanceof ApiFetchError ? e.message : 'Erro ao carregar o projeto.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [projectId, user?.id]);

  const toggleColaborador = (id: number) => {
    setColaboradores((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  };

  const salvar = async () => {
    setErro(null);
    setErroTitulo(null);
    if (assigneeId == null) {
      setErro('Selecione um responsável.');
      return;
    }
    const horas = estimatedHours.trim() ? Number(estimatedHours.trim()) : null;
    if (horas != null && Number.isNaN(horas)) {
      setErro('Estimativa de horas inválida.');
      return;
    }
    setSalvando(true);
    try {
      await createTask(projectId, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate: dueDate.trim() || null,
        estimatedHours: horas,
        assigneeId,
        collaboratorIds: colaboradores.filter((id) => id !== assigneeId),
      });
      navigation.goBack();
    } catch (e) {
      if (e instanceof ApiFetchError) {
        setErroTitulo(e.fieldErrors?.title ?? null);
        setErro(e.fieldErrors?.title ? null : e.message);
      } else {
        setErro('Não foi possível criar a tarefa.');
      }
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Nova Tarefa</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Implementar tela de login"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
        />
        {erroTitulo && <Text style={styles.errorText}>{erroTitulo}</Text>}

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detalhes da tarefa..."
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Prioridade *</Text>
        <View style={styles.chipsWrap}>
          {PRIORITY_ORDER.map((p) => {
            const ativo = priority === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.chip, ativo && styles.chipActive]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.chipText, ativo && styles.chipTextActive]}>{PRIORITY_LABEL[p]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Prazo (AAAA-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-06-18"
          placeholderTextColor="#94A3B8"
          value={dueDate}
          onChangeText={setDueDate}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Estimativa (horas)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 4"
          placeholderTextColor="#94A3B8"
          value={estimatedHours}
          onChangeText={setEstimatedHours}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Responsável *</Text>
        <View style={styles.chipsWrap}>
          {membros.map((m) => {
            const ativo = assigneeId === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.chip, ativo && styles.chipActive]}
                onPress={() => setAssigneeId(m.id)}
              >
                <Text style={[styles.chipText, ativo && styles.chipTextActive]}>
                  {iniciais(m.name)} · {m.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Colaboradores</Text>
        <View style={styles.chipsWrap}>
          {membros
            .filter((m) => m.id !== assigneeId)
            .map((m) => {
              const ativo = colaboradores.includes(m.id);
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.chip, ativo && styles.chipActive]}
                  onPress={() => toggleColaborador(m.id)}
                >
                  <Text style={[styles.chipText, ativo && styles.chipTextActive]}>
                    {iniciais(m.name)} · {m.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>

        {erro && <Text style={styles.errorText}>{erro}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, salvando && styles.primaryButtonDisabled]}
          onPress={salvar}
          disabled={salvando}
        >
          {salvando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Criar Tarefa</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  backButton: { marginRight: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  backIcon: { fontSize: 20, color: '#64748B' },
  pageTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  content: { padding: 24, paddingBottom: 60 },
  label: { fontSize: 14, color: '#475569', marginBottom: 8, fontWeight: '500', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0F172A', marginBottom: 8, backgroundColor: '#FFFFFF' },
  textArea: { height: 100, textAlignVertical: 'top' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, marginBottom: 8, backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF' },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 8 },
  primaryButton: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
