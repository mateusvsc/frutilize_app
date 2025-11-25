import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { useRouter } from 'expo-router';

export default function Index(): React.JSX.Element {
  const router = useRouter();

  const handleStartShopping = () => {
    router.push('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>🍎 Frutilize</ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Sua feira online de frutas e legumes frescos
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.features}>
          <ThemedView style={styles.featureCard}>
            <ThemedText style={styles.featureEmoji}>🛒</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
              Faça seu pedido
            </ThemedText>
            <ThemedText type="default" style={styles.featureDescription}>
              Escolha entre diversas frutas, legumes e verduras frescos
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.featureCard}>
            <ThemedText style={styles.featureEmoji}>📱</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
              Envie direto pro WhatsApp
            </ThemedText>
            <ThemedText type="default" style={styles.featureDescription}>
              Seu pedido é enviado automaticamente para nosso WhatsApp
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.featureCard}>
            <ThemedText style={styles.featureEmoji}>🚚</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
              Entrega rápida
            </ThemedText>
            <ThemedText type="default" style={styles.featureDescription}>
              Receba seus produtos fresquinhos em casa
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartShopping}
        >
          <ThemedText style={styles.startButtonText}>
            Começar a Comprar 🛒
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    fontSize: 16,
    lineHeight: 22,
  },
  features: {
    width: '100%',
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    textAlign: 'center',
    marginBottom: 6,
    fontSize: 16,
  },
  featureDescription: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});