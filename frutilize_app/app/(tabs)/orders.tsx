import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { useRouter } from 'expo-router';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useCustomer } from '../../hooks/useCostumer';
import { getAllOrders, getCustomerOrders } from '../../database/database';
import { Order } from '../../types';
import { formatPrice } from '../../utils/whatsapp';

export default function OrdersScreen(): React.JSX.Element {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { customer } = useCustomer();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [customer]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      let ordersData: Order[] = [];
      
      if (customer?.id) {
        // Carrega pedidos do cliente específico
        ordersData = await getCustomerOrders(customer.id);
      } else {
        // Carrega todos os pedidos (para demonstração)
        ordersData = await getAllOrders();
      }
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Erro', 'Não foi possível carregar os pedidos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = () => {
    const phoneNumber = '5521968982850';
    const url = `https://wa.me/${phoneNumber}`;
    Linking.openURL(url);
  };

  const openModal = () => {
    router.push('/modal');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#2E8B57';
      case 'delivered':
        return '#008000';
      case 'pending':
      default:
        return '#FFA500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'delivered':
        return 'Entregue';
      case 'pending':
      default:
        return 'Pendente';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'credit':
        return 'Cartão de Crédito';
      case 'debit':
        return 'Cartão de Débito';
      case 'vr':
        return 'Vale Refeição (VR)';
      case 'cash':
        return 'Dinheiro';
      default:
        return method;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title">📞 Contato & Pedidos</ThemedText>
          <ThemedText type="default">Informações e histórico</ThemedText>
        </ThemedView>

        {/* Seção de Contato */}
        <ThemedView style={styles.contactCard}>
          <ThemedText style={styles.contactEmoji}>📱</ThemedText>
          <ThemedText type="subtitle" style={styles.contactTitle}>
            WhatsApp
          </ThemedText>
          <ThemedText type="default" style={styles.contactNumber}>
            (21) 96898-2850
          </ThemedText>
          <ThemedText type="default" style={styles.contactDescription}>
            Clique abaixo para falar diretamente conosco no WhatsApp
          </ThemedText>
          
          <TouchableOpacity 
            style={[
              styles.whatsappButton,
              { backgroundColor: colorScheme === 'dark' ? '#25D366' : '#25D366' }
            ]}
            onPress={handleContact}
          >
            <ThemedText style={styles.whatsappButtonText}>
              💬 Abrir WhatsApp
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Seção de Informações */}
        <TouchableOpacity 
          style={styles.infoCard}
          onPress={openModal}
        >
          <ThemedText style={styles.infoEmoji}>ℹ️</ThemedText>
          <ThemedText type="subtitle" style={styles.infoTitle}>
            Mais Informações
          </ThemedText>
          <ThemedText type="default" style={styles.infoDescription}>
            Horários, entregas, pagamentos e como funciona
          </ThemedText>
        </TouchableOpacity>

        {/* Seção de Pedidos */}
        <ThemedView style={styles.ordersSection}>
          <ThemedText type="subtitle" style={styles.ordersTitle}>
            📦 Meus Pedidos
          </ThemedText>
          
          {isLoading ? (
            <ThemedView style={styles.loadingContainer}>
              <ThemedText type="default">Carregando pedidos...</ThemedText>
            </ThemedView>
          ) : orders.length === 0 ? (
            <ThemedView style={styles.emptyOrders}>
              <ThemedText style={styles.emptyEmoji}>📦</ThemedText>
              <ThemedText type="default" style={styles.emptyText}>
                Nenhum pedido encontrado
              </ThemedText>
              <ThemedText type="default" style={styles.emptyDescription}>
                Faça seu primeiro pedido para ver o histórico aqui!
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.ordersList}>
              {orders.slice(0, 5).map((order) => (
                <ThemedView key={order.id} style={styles.orderCard}>
                  <ThemedView style={styles.orderHeader}>
                    <ThemedText type="defaultSemiBold">
                      Pedido #{order.id}
                    </ThemedText>
                    <ThemedView style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) }
                    ]}>
                      <ThemedText style={styles.statusText}>
                        {getStatusText(order.status)}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  <ThemedText type="default" style={styles.orderDate}>
                    {new Date(order.createdAt!).toLocaleDateString('pt-BR')}
                  </ThemedText>
                  
                  <ThemedText type="default" style={styles.orderInfo}>
                    💳 {getPaymentMethodText(order.paymentMethod)}
                  </ThemedText>
                  
                  {order.changeFor && (
                    <ThemedText type="default" style={styles.orderInfo}>
                      💰 Troco para: {formatPrice(order.changeFor)}
                    </ThemedText>
                  )}
                  
                  <ThemedView style={styles.orderTotal}>
                    <ThemedText type="defaultSemiBold">Total:</ThemedText>
                    <ThemedText type="defaultSemiBold">
                      {formatPrice(order.total)}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              ))}
              
              {orders.length > 5 && (
                <ThemedText type="default" style={styles.moreOrders}>
                  + {orders.length - 5} pedidos anteriores
                </ThemedText>
              )}
            </ThemedView>
          )}
        </ThemedView>

        {/* Seção de Recursos */}
        <ThemedView style={styles.features}>
          <ThemedView style={styles.feature}>
            <ThemedText style={styles.featureEmoji}>🚚</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.featureText}>
              Entrega Rápida
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.feature}>
            <ThemedText style={styles.featureEmoji}>💳</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.featureText}>
              Vários Pagamentos
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.feature}>
            <ThemedText style={styles.featureEmoji}>⭐</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.featureText}>
              Qualidade Garantida
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Cliente Logado */}
        {customer && (
          <ThemedView style={styles.customerInfo}>
            <ThemedText type="defaultSemiBold" style={styles.customerTitle}>
              👤 Cliente Cadastrado
            </ThemedText>
            <ThemedText type="default" style={styles.customerText}>
              {customer.name}
            </ThemedText>
            <ThemedText type="default" style={styles.customerText}>
              {customer.phone}
            </ThemedText>
            <ThemedText type="default" style={styles.customerText}>
              {customer.neighborhood}
            </ThemedText>
          </ThemedView>
        )}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  contactCard: {
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  contactEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  contactTitle: {
    marginBottom: 5,
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactDescription: {
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  whatsappButton: {
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: 'rgba(46, 139, 87, 0.05)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(46, 139, 87, 0.2)',
  },
  infoEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  infoTitle: {
    marginBottom: 5,
  },
  infoDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
  ordersSection: {
    marginBottom: 20,
  },
  ordersTitle: {
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyOrders: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: 'rgba(46, 139, 87, 0.05)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(46, 139, 87, 0.1)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderDate: {
    opacity: 0.7,
    fontSize: 12,
    marginBottom: 8,
  },
  orderInfo: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  moreOrders: {
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
    marginTop: 8,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
    padding: 10,
  },
  featureEmoji: {
    fontSize: 20,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 10,
    textAlign: 'center',
  },
  customerInfo: {
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  customerTitle: {
    marginBottom: 8,
    fontSize: 14,
  },
  customerText: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 2,
  },
});