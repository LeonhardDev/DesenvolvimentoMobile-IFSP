import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importando as nossas telas prontas
import { LoginScreen } from './src/screens/LoginScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { TaskDetailsScreen } from './src/screens/TaskDetailsScreen';

// Telas temporárias vazias para o menu e detalhes
const DummyScreen = () => <View style={{ flex: 1, backgroundColor: '#F8FAFC' }} />;
const TaskDetailsDummy = () => <View style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}><Text>Tela de Detalhes (Em breve!)</Text></View>;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
      {/* Tela de Início conectada! */}
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
      
      {/* Tela de Perfil conectada! */}
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{ tabBarIcon: () => <Text>👤</Text> }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
