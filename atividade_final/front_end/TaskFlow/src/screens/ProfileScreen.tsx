import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function ProfileScreen() {
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    // Aqui o back-end vai limpar o JWT do AsyncStorage no futuro
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <Text style={styles.pageTitle}>Meu Perfil</Text>

        {/* Card de Informações do Usuário */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
          <Text style={styles.userName}>Ana Silva</Text>
          <Text style={styles.userEmail}>ana.silva@email.com</Text>
          
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>Administrador</Text>
          </View>
        </View>

        {/* Opções do Menu */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Configurações da Conta</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={styles.menuText}>Relatórios de Produtividade</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* Botão de Sair */}
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 24 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 32 },
  
  profileCard: { backgroundColor: '#FFFFFF', padding: 32, borderRadius: 24, alignItems: 'center', marginBottom: 32, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  rolePill: { backgroundColor: '#E0E7FF', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16 },
  roleText: { color: '#3730A3', fontSize: 12, fontWeight: 'bold' },

  menuContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIcon: { fontSize: 20, marginRight: 16 },
  menuText: { flex: 1, fontSize: 16, color: '#0F172A', fontWeight: '500' },
  menuChevron: { fontSize: 20, color: '#94A3B8' },
  
  logoutItem: { borderBottomWidth: 0 },
  logoutText: { flex: 1, fontSize: 16, color: '#EF4444', fontWeight: 'bold' }
});