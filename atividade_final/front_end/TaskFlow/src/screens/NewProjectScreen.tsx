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
import { useNavigation } from '@react-navigation/native';
import { createProject } from '../api/projects';
import { listUsers } from '../api/users';
import { ApiFetchError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { UserSummary } from '../types';
import { iniciais } from '../utils/mappers';

export function NewProjectScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [usuarios, setUsuarios] = useState<UserSummary[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    // Lista de usuários para escolher os membros (o autor já entra como dono automaticamente).
    (async () => {
      try {
        const todos = await listUsers();
        setUsuarios(todos.filter((u) => u.id !== user?.id));
      } catch {
        // Sem lista de usuários ainda dá para criar um projeto só com o dono.
      }
    })();
  }, [user?.id]);

  const toggleMembro = (id: number) => {
    setSelecionados((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  };

  const salvar = async () => {
    setErro(null);
    setErroNome(null);
    setSalvando(true);
    try {
      await createProject({
        name: name.trim(),
        category: category.trim() || null,
        memberIds: selecionados,
      });
      navigation.goBack();
    } catch (e) {
      if (e instanceof ApiFetchError) {
        setErroNome(e.fieldErrors?.name ?? null);
        if (!e.fieldErrors?.name) setErro(e.message);
      } else {
        setErro('Não foi possível criar o projeto.');
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Novo Projeto</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Redesign do Site"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
        />
        {erroNome && <Text style={styles.errorText}>{erroNome}</Text>}

        <Text style={styles.label}>Categoria</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Design & Dev"
          placeholderTextColor="#94A3B8"
          value={category}
          onChangeText={setCategory}
        />

        <Text style={styles.label}>Membros</Text>
        {usuarios.length === 0 ? (
          <Text style={styles.hintText}>Nenhum outro usuário disponível.</Text>
        ) : (
          <View style={styles.chipsWrap}>
            {usuarios.map((u) => {
              const ativo = selecionados.includes(u.id);
              return (
                <TouchableOpacity
                  key={u.id}
                  style={[styles.chip, ativo && styles.chipActive]}
                  onPress={() => toggleMembro(u.id)}
                >
                  <Text style={[styles.chipText, ativo && styles.chipTextActive]}>
                    {iniciais(u.name)} · {u.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {erro && <Text style={styles.errorText}>{erro}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, salvando && styles.primaryButtonDisabled]}
          onPress={salvar}
          disabled={salvando}
        >
          {salvando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Criar Projeto</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  backButton: { marginRight: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  backIcon: { fontSize: 20, color: '#64748B' },
  pageTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  content: { padding: 24, paddingBottom: 60 },
  label: { fontSize: 14, color: '#475569', marginBottom: 8, fontWeight: '500', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0F172A', marginBottom: 8, backgroundColor: '#FFFFFF' },
  hintText: { fontSize: 13, color: '#94A3B8', marginBottom: 8 },
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
