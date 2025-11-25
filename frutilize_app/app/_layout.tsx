import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '../hooks/use-color-scheme';
import { initDatabase } from '../database/database'; // Importe a função

export default function RootLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();

  useEffect(() => {
  const initializeApp = async () => {
    try {
      await initDatabase();
      console.log('Database initialized successfully');
      
      // Teste opcional: verificar tabelas
      const { checkTables } = await import('../database/database');
      await checkTables();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  initializeApp();
}, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colorScheme === 'dark' ? '#0F1F1A' : '#FFFFFF',
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}