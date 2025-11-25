import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput,
  Modal,
  StyleSheet,
  RefreshControl 
} from 'react-native';
import { getAllOrdersWithCustomers, updateOrderStatus, printDatabaseLog, getOrderStatistics } from '../../database/database';
import { useAuth } from '../../hooks/useAuth';
import { useBrasiliaTime } from '../../hooks/useBrasiliaTime';

interface AdminOrder {
  id: number;
  customerId: number;
  items: string;
  total: number;
  paymentMethod: string;
  changeFor: number | null;
  status: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNeighborhood: string;
  customerReference: string;
  formattedItems: string;
}

interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  statusBreakdown: Array<{ status: string; count: number }>;
}

const ADMIN_PASSWORD = '0406';

export default function AdminScreen() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  
  const { logout } = useAuth();
  const { formatTime, formatDate, currentTime } = useBrasiliaTime();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setPassword('');
      setAttempts(0);
      loadOrders();
      loadStatistics();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        Alert.alert('Acesso Bloqueado', 'Muitas tentativas falhas. Tente novamente mais tarde.');
        setShowPasswordModal(false);
      } else {
        Alert.alert('Senha Incorreta', `Tentativa ${newAttempts} de 3. Tente novamente.`);
        setPassword('');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        onPress: () => {
          setIsAuthenticated(false);
          setShowPasswordModal(true);
          setPassword('');
          setAttempts(0);
          setOrders([]);
          setStatistics(null);
          logout();
        }, 
        style: 'destructive' 
      }
    ]);
  };

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const ordersData = await getAllOrdersWithCustomers();
      const convertedOrders: AdminOrder[] = ordersData.map(order => ({
        id: order.id,
        customerId: order.customerId,
        items: order.items,
        total: order.total,
        paymentMethod: order.paymentMethod,
        changeFor: order.changeFor,
        status: order.status,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        customerNeighborhood: order.customerNeighborhood,
        customerReference: order.customerReference,
        formattedItems: order.formattedItems
      }));
      setOrders(convertedOrders);
    } catch (error) {
      console.error('Erro carregando pedidos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os pedidos');
    } finally {
      setRefreshing(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getOrderStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Erro carregando estatísticas:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
    loadStatistics();
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      Alert.alert('Sucesso', `Pedido #${orderId} atualizado para: ${getStatusText(newStatus)}`);
      loadOrders();
      loadStatistics();
    } catch (error) {
      console.error('Erro atualizando status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status');
    }
  };

  const handlePrintLog = async () => {
    await printDatabaseLog();
    Alert.alert('Log Gerado', 'Verifique o console do desenvolvedor');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'preparing': return '#4169E1';
      case 'delivered': return '#32CD32';
      case 'cancelled': return '#FF0000';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      case 'vr': return 'Vale Refeição';
      case 'cash': return 'Dinheiro';
      default: return method;
    }
  };

  const formatOrderItems = (itemsString: string): string => {
    try {
      const items = JSON.parse(itemsString);
      
      if (!Array.isArray(items)) {
        return 'Itens inválidos';
      }
      
      return items.map(item => {
        const product = item.product;
        const quantity = item.quantity;
        const unit = product.unit || 'un';
        
        if (unit === 'kg') {
          return `• ${product.name} - ${quantity}kg`;
        } else if (unit === 'un') {
          return `• ${product.name} - ${quantity} unidade${quantity > 1 ? 's' : ''}`;
        } else {
          return `• ${product.name} - ${quantity}x`;
        }
      }).join('\n');
      
    } catch (error) {
      console.error('Erro formatando itens do pedido:', error);
      return 'Erro ao carregar itens';
    }
  };

  const getLocalStatistics = () => {
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const preparingOrders = orders.filter(order => order.status === 'preparing').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

    return {
      pendingOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,
      totalOrders: orders.length
    };
  };

  const localStats = getLocalStatistics();

  if (showPasswordModal) {
    return (
      <Modal visible={showPasswordModal} animationType="slide">
        <View style={styles.passwordContainer}>
          <Text style={styles.passwordTitle}>🔐 Acesso Administrativo</Text>
          <Text style={styles.passwordSubtitle}>Digite a senha de acesso</Text>
          
          <TextInput
            style={styles.passwordInput}
            placeholder="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            keyboardType="numeric"
            maxLength={4}
            autoFocus
            placeholderTextColor="#999"
          />
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          <Text style={styles.attemptsText}>
            Tentativas: {attempts}/3
          </Text>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowPasswordModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🏪 Painel do Administrador</Text>
          <Text style={styles.timeText}>
            {formatDate(currentTime)} - {formatTime(currentTime)}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          onPress={handlePrintLog}
          style={styles.logButton}
        >
          <Text style={styles.buttonText}>📋 Gerar Log</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onRefresh}
          style={styles.refreshButton}
        >
          <Text style={styles.buttonText}>🔄 Atualizar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {localStats.pendingOrders}
          </Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {localStats.preparingOrders}
          </Text>
          <Text style={styles.statLabel}>Preparando</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {localStats.deliveredOrders}
          </Text>
          <Text style={styles.statLabel}>Entregues</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{localStats.totalOrders}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {statistics && (
        <View style={styles.financialStats}>
          <Text style={styles.financialTitle}>💰 Resumo Financeiro</Text>
          <View style={styles.financialRow}>
            <Text>Receita Total:</Text>
            <Text style={styles.financialValue}>
              R$ {statistics.totalRevenue?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text>Ticket Médio:</Text>
            <Text style={styles.financialValue}>
              R$ {statistics.averageOrderValue?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text>Clientes Únicos:</Text>
            <Text style={styles.financialValue}>
              {statistics.uniqueCustomers || 0}
            </Text>
          </View>
        </View>
      )}

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E8B57']}
            tintColor="#2E8B57"
          />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.noOrders}>
            <Text style={styles.noOrdersEmoji}>📦</Text>
            <Text style={styles.noOrdersText}>Nenhum pedido encontrado</Text>
            <Text style={styles.noOrdersSubtext}>Os pedidos aparecerão aqui quando forem feitos</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View 
              key={order.id} 
              style={styles.orderCard}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Pedido #{order.id}</Text>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')} - {' '}
                    {new Date(order.createdAt).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
                <Text style={{ 
                  color: getStatusColor(order.status), 
                  fontWeight: 'bold',
                  fontSize: 12,
                  backgroundColor: getStatusColor(order.status) + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12
                }}>
                  {getStatusText(order.status).toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>👤 {order.customerName}</Text>
                <Text style={styles.customerDetail}>📞 {order.customerPhone}</Text>
                <Text style={styles.customerDetail}>📍 {order.customerAddress}, {order.customerNeighborhood}</Text>
                {order.customerReference && (
                  <Text style={styles.customerDetail}>🏷️ Ref: {order.customerReference}</Text>
                )}
              </View>
              
              <View style={styles.itemsContainer}>
                <Text style={styles.itemsTitle}>🛒 Itens do Pedido:</Text>
                <Text style={styles.itemsText}>
                  {order.formattedItems || formatOrderItems(order.items)}
                </Text>
              </View>
              
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentText}>
                  💳 {getPaymentMethodText(order.paymentMethod)}
                </Text>
                {order.changeFor !== null && order.changeFor !== undefined && (
                  <Text style={styles.paymentText}>
                    💰 Troco para: R$ {order.changeFor.toFixed(2)}
                  </Text>
                )}
                <Text style={styles.totalText}>
                  🎯 Total: R$ {order.total.toFixed(2)}
                </Text>
              </View>

              <View style={styles.statusButtons}>
                <TouchableOpacity 
                  onPress={() => handleUpdateStatus(order.id, 'preparing')}
                  style={[styles.statusButton, { backgroundColor: '#4169E1' }]}
                  disabled={order.status === 'preparing' || order.status === 'delivered' || order.status === 'cancelled'}
                >
                  <Text style={styles.statusButtonText}>
                    {order.status === 'preparing' ? '✅ Preparando' : '👨‍🍳 Preparando'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleUpdateStatus(order.id, 'delivered')}
                  style={[styles.statusButton, { backgroundColor: '#32CD32' }]}
                  disabled={order.status === 'delivered' || order.status === 'cancelled'}
                >
                  <Text style={styles.statusButtonText}>
                    {order.status === 'delivered' ? '✅ Entregue' : '🚚 Entregue'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleUpdateStatus(order.id, 'cancelled')}
                  style={[styles.statusButton, { backgroundColor: '#FF0000' }]}
                  disabled={order.status === 'cancelled' || order.status === 'delivered'}
                >
                  <Text style={styles.statusButtonText}>
                    {order.status === 'cancelled' ? '❌ Cancelado' : '❌ Cancelar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  passwordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  passwordTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E8B57',
  },
  passwordSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  passwordInput: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: 'white',
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#2E8B57',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  attemptsText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  logButton: {
    backgroundColor: '#5856D6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  refreshButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  financialStats: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  financialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E8B57',
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  financialValue: {
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  orderCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  customerInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  customerName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemsContainer: {
    marginTop: 12,
  },
  itemsTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
  },
  itemsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  paymentInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  paymentText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginTop: 4,
  },
  statusButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  statusButton: {
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  statusButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noOrders: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 20,
  },
  noOrdersEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noOrdersText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  noOrdersSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});