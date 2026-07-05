import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Telas
import { LoginScreen } from './src/screens/LoginScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { TaskDetailsScreen } from './src/screens/TaskDetailsScreen';
import { NewProjectScreen } from './src/screens/NewProjectScreen';
import { NewTaskScreen } from './src/screens/NewTaskScreen';

// Autenticação e tipos de rota
import { AuthProvider, useAuth } from './src/context/AuthContext';
import type { MainTabParamList, RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Menu Inferior
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#0F172A',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tab.Screen
        name="Projetos"
        component={ProjectsScreen}
        options={{ tabBarIcon: () => <Text>📁</Text> }}
      />
      <Tab.Screen
        name="Tarefas"
        component={TasksScreen}
        options={{ tabBarIcon: () => <Text>✅</Text> }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ tabBarIcon: () => <Text>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

// Escolhe entre a tela de login e o app conforme a sessão, esperando a restauração do token.
function RootNavigator() {
  const { user, restoring } = useAuth();

  if (restoring) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user == null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
            <Stack.Screen name="NewProject" component={NewProjectScreen} />
            <Stack.Screen name="NewTask" component={NewTaskScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
