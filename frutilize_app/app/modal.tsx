import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { useRouter } from 'expo-router';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function ModalScreen(): React.JSX.Element {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleContact = () => {
    const phoneNumber = '5521968982850';
    const url = `https://wa.me/${phoneNumber}`;
    Linking.openURL(url);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">ℹ️ Sobre o Frutilize</ThemedText>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">📞 Contato</ThemedText>
            <ThemedText type="default" style={styles.sectionText}>
              Entre em contato conosco pelo WhatsApp:
            </ThemedText>
            <TouchableOpacity 
              style={[
                styles.contactButton,
                { backgroundColor: colorScheme === 'dark' ? '#25D366' : '#25D366' }
              ]}
              onPress={handleContact}
            >
              <ThemedText style={styles.contactButtonText}>
                📱 (21) 96898-2850
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">🚚 Entrega</ThemedText>
            <ThemedText type="default" style={styles.sectionText}>
              • Entregamos em toda a região{'\n'}
              • Pedido mínimo: R$ 30,00{'\n'}
              • Taxa de entrega: Consulte{'\n'}
              • Horário: Seg a Sáb, 8h às 18h
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">💳 Pagamento</ThemedText>
            <ThemedText type="default" style={styles.sectionText}>
              • Dinheiro{'\n'}
              • PIX{'\n'}
              • Cartão de crédito/débito{'\n'}
              • Transferência bancária
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">🛒 Como Funciona</ThemedText>
            <ThemedText type="default" style={styles.sectionText}>
              1. Escolha seus produtos{'\n'}
              2. Adicione ao carrinho{'\n'}
              3. Revise seu pedido{'\n'}
              4. Envie para nosso WhatsApp{'\n'}
              5. Confirmaremos e entregaremos!
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">⭐ Qualidade</ThemedText>
            <ThemedText type="default" style={styles.sectionText}>
              Trabalhamos apenas com produtos frescos e de qualidade, selecionados diariamente para você e sua família.
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.footer}>
            <ThemedText type="default" style={styles.footerText}>
              🍎 Obrigado por escolher o Frutilize! 🍎
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionText: {
    marginTop: 8,
    lineHeight: 22,
    opacity: 0.8,
  },
  contactButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});