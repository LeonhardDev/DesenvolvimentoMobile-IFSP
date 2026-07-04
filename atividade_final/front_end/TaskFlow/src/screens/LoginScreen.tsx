import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView
} from 'react-native';

export function LoginScreen() {
  const navigation = useNavigation<any>();  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  
  const handleLogin = () => {
    // No futuro, aqui entrará a lógica de Autenticação com o Back-end
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoIcon}>☑</Text>
          </View>
          <Text style={styles.appName}>TaskFlow</Text>
          <Text style={styles.subtitle}>Gerencie tarefas em equipe</Text>
        </View>

        {/* Card de Login */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar na sua conta</Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </View>

        {/* Divisor e Login Social */}
        <View style={styles.socialSection}>
          <Text style={styles.dividerText}>ou continue com</Text>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>Entrar com Google</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Cor de fundo base do figma
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    color: '#FFFFFF',
    fontSize: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  socialSection: {
    alignItems: 'center',
  },
  dividerText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 20,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '500',
  },
});