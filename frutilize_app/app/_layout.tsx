import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '../hooks/use-color-scheme';
import { initDatabase } from '../database/database';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ReportService } from '../services/reportServices';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDatabase();
        console.log('Database inicializado com sucesso');
        
        const { checkTables } = await import('../database/database');
        await checkTables();

        if (user?.role === 'admin') {
          const reportService = ReportService.getInstance();
          reportService.startDailyScheduler();
        }
      } catch (error) {
        console.error('Falha inicializando database:', error);
      }
    };

    initializeApp();
  }, [user]);

  return <>{children}</>;
}

export default function RootLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppInitializer>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: colorScheme === 'dark' ? '#0F1F1A' : '#FFFFFF',
                },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ 
                presentation: 'modal',
                headerShown: false 
              }} />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </AppInitializer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}