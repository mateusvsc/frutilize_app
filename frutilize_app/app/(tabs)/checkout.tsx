import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { useCart } from '../../hooks/useCart';
import { useCustomer } from '../../hooks/useCostumer';
import { sendWhatsAppOrder } from '../../utils/whatsapp';
import { saveCustomerAndOrder } from '../../database/database';
import { PaymentMethod } from '../../types/index';
import { useRouter } from 'expo-router';

// Interface para os dados do formulário
interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  reference: string;
}

// Opções de pagamento
const PAYMENT_METHODS = [
  { id: 'pix' as PaymentMethod, name: 'PIX', emoji: '📱' },
  { id: 'credit' as PaymentMethod, name: 'Cartão de Crédito', emoji: '💳' },
  { id: 'debit' as PaymentMethod, name: 'Cartão de Débito', emoji: '💳' },
  { id: 'vr' as PaymentMethod, name: 'Vale Refeição (VR)', emoji: '🍽️' },
  { id: 'cash' as PaymentMethod, name: 'Dinheiro', emoji: '💰' },
];

export default function CheckoutScreen(): React.JSX.Element {
  // Hooks e context
  const { items, clearCart, getTotal } = useCart();
  const { customer, loadLastCustomer } = useCustomer();
  const router = useRouter();
  
  // Estados do formulário
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    phone: '',
    address: '',
    neighborhood: '',
    reference: '',
  });

  // Estados da UI
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [showChangeInput, setShowChangeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcula o total
  const total = getTotal();

  // Carrega último cliente ao montar o componente
  useEffect(() => {
    loadLastCustomer();
  }, []);

  // Preenche formulário quando cliente é carregado
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        neighborhood: customer.neighborhood || '',
        reference: customer.reference || '',
      });
    }
  }, [customer]);

  // Mostra/oculta campo de troco baseado no método de pagamento
  useEffect(() => {
    setShowChangeInput(paymentMethod === 'cash');
    if (paymentMethod !== 'cash') {
      setChangeFor('');
    }
  }, [paymentMethod]);

  // Manipula mudanças nos campos do formulário
  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Formata número de telefone enquanto digita
  const handlePhoneChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers;
    
    if (numbers.length <= 11) {
      if (numbers.length > 6) {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      } else if (numbers.length > 2) {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length > 0) {
        formatted = `(${numbers}`;
      }
    }
    
    handleInputChange('phone', formatted);
  };

  // Valida se o formulário está pronto para submit
  const isFormValid = (): boolean => {
    const { name, phone, address, neighborhood } = formData;
    const cleanPhone = phone.replace(/\D/g, '');
    
    return (
      name.trim().length >= 2 &&
      cleanPhone.length >= 10 &&
      address.trim().length >= 5 &&
      neighborhood.trim().length >= 2 &&
      items.length > 0
    );
  };

  // Validações específicas para checkout
  const validateCheckout = (): string | null => {
    const { name, phone, address, neighborhood } = formData;
    const cleanPhone = phone.replace(/\D/g, '');

    if (!name.trim()) return 'Por favor, informe seu nome completo.';
    if (name.trim().length < 2) return 'O nome deve ter pelo menos 2 caracteres.';
    if (!cleanPhone) return 'Por favor, informe seu WhatsApp.';
    if (cleanPhone.length < 10) return 'Informe um número de WhatsApp válido.';
    if (!address.trim()) return 'Por favor, informe seu endereço.';
    if (address.trim().length < 5) return 'O endereço deve ser mais detalhado.';
    if (!neighborhood.trim()) return 'Por favor, informe seu bairro.';
    if (items.length === 0) return 'Adicione itens ao carrinho antes de finalizar.';
    if (paymentMethod === 'cash' && changeFor && parseFloat(changeFor) < total) {
      return 'O valor para troco deve ser maior ou igual ao total do pedido.';
    }

    return null;
  };

  // Processa o checkout completo
  const handleCheckout = async (): Promise<void> => {
    const validationError = validateCheckout();
    if (validationError) {
      Alert.alert('Atenção', validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados
      const customerData = {
        name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        address: formData.address.trim(),
        neighborhood: formData.neighborhood.trim(),
        reference: formData.reference.trim(),
      };

      // CORREÇÃO: Chamar a função com os parâmetros corretos
      const { customerId, orderId } = await saveCustomerAndOrder(
        customerData,
        items, // cartItems
        paymentMethod, // paymentMethod
        changeFor ? parseFloat(changeFor) : undefined // changeFor
      );

      console.log('✅ Pedido salvo:', { customerId, orderId });

      // Enviar para WhatsApp
      await sendWhatsAppOrder(
        items, 
        total, 
        customerData, 
        paymentMethod, 
        changeFor ? parseFloat(changeFor) : undefined
      );

      // Limpar carrinho e navegar
      clearCart();
      
      // Mostrar confirmação
      Alert.alert(
        '🎉 Pedido Enviado!', 
        `Seu pedido #${orderId} foi enviado para nosso WhatsApp.\n\nEntraremos em contato em breve para confirmar.`,
        [
          { 
            text: 'Voltar às Compras', 
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );

    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      Alert.alert(
        'Erro', 
        'Não foi possível enviar o pedido. Verifique sua conexão e tente novamente.\n\n' + 
        'Se o problema persistir, entre em contato diretamente pelo WhatsApp.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderiza campo de entrada
  const renderInputField = (
    label: string,
    field: keyof CheckoutFormData,
    placeholder: string,
    options: { keyboardType?: any; multiline?: boolean } = {}
  ) => (
    <ThemedView style={styles.inputGroup}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          options.multiline && styles.multilineInput
        ]}
        value={formData[field]}
        onChangeText={(value) => 
          field === 'phone' ? handlePhoneChange(value) : handleInputChange(field, value)
        }
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline}
        numberOfLines={options.multiline ? 3 : 1}
        editable={!isSubmitting}
      />
    </ThemedView>
  );

  // Renderiza método de pagamento
  const renderPaymentMethod = (method: typeof PAYMENT_METHODS[0]) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        paymentMethod === method.id && styles.paymentMethodSelected,
        isSubmitting && styles.paymentMethodDisabled
      ]}
      onPress={() => !isSubmitting && setPaymentMethod(method.id)}
      disabled={isSubmitting}
    >
      <ThemedText style={styles.paymentEmoji}>{method.emoji}</ThemedText>
      <ThemedText 
        style={[
          styles.paymentText,
          paymentMethod === method.id && styles.paymentTextSelected
        ]}
      >
        {method.name}
      </ThemedText>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">📋 Finalizar Pedido</ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Complete seus dados para entrega
          </ThemedText>
        </ThemedView>

        {/* Formulário de Dados */}
        <ThemedView style={styles.form}>
          {renderInputField('Nome completo *', 'name', 'Seu nome completo')}
          {renderInputField('WhatsApp *', 'phone', '(21) 99999-9999', { keyboardType: 'phone-pad' })}
          {renderInputField('Endereço *', 'address', 'Rua, número, apartamento', { multiline: true })}
          {renderInputField('Bairro *', 'neighborhood', 'Seu bairro')}
          {renderInputField('Ponto de referência', 'reference', 'Ex: Próximo ao mercado, casa com portão azul', { multiline: true })}
        </ThemedView>

        {/* Método de Pagamento */}
        <ThemedView style={styles.form}>
          <ThemedView style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Forma de Pagamento *
            </ThemedText>
            <ThemedView style={styles.paymentMethods}>
              {PAYMENT_METHODS.map(renderPaymentMethod)}
            </ThemedView>
          </ThemedView>

          {showChangeInput && (
            <ThemedView style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Precisa de troco? (Opcional)
              </ThemedText>
              <ThemedText type="default" style={styles.helperText}>
                Informe o valor em dinheiro que você vai pagar
              </ThemedText>
              <TextInput
                style={styles.input}
                value={changeFor}
                onChangeText={setChangeFor}
                placeholder={`Ex: R$ ${(total + 20).toFixed(2).replace('.', ',')}`}
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={!isSubmitting}
              />
              {changeFor && parseFloat(changeFor) > 0 && (
                <ThemedText type="default" style={styles.changeInfo}>
                  Troco: R$ {(parseFloat(changeFor) - total).toFixed(2).replace('.', ',')}
                </ThemedText>
              )}
            </ThemedView>
          )}
        </ThemedView>

        {/* Resumo do Pedido */}
        <ThemedView style={styles.summary}>
          <ThemedText type="subtitle" style={styles.summaryTitle}>
            Resumo do Pedido
          </ThemedText>
          <ThemedView style={styles.totalContainer}>
            <ThemedText type="defaultSemiBold">Total:</ThemedText>
            <ThemedText type="subtitle">R$ {total.toFixed(2).replace('.', ',')}</ThemedText>
          </ThemedView>
          <ThemedText type="default" style={styles.itemsCount}>
            {items.length} {items.length === 1 ? 'item' : 'itens'} no carrinho
          </ThemedText>
          <ThemedText type="default" style={styles.paymentSummary}>
            Pagamento: {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}
          </ThemedText>
          {paymentMethod === 'cash' && changeFor && parseFloat(changeFor) > 0 && (
            <ThemedText type="default" style={styles.changeSummary}>
              Troco para: R$ {parseFloat(changeFor).toFixed(2).replace('.', ',')}
            </ThemedText>
          )}
        </ThemedView>
      </ScrollView>

      {/* Botão de Finalizar */}
      <ThemedView style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.checkoutButton,
            (!isFormValid() || isSubmitting) && styles.checkoutButtonDisabled
          ]}
          onPress={handleCheckout}
          disabled={!isFormValid() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <ThemedText style={styles.checkoutText}>
              📱 Finalizar Pedido no WhatsApp
            </ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
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
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethod: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  paymentMethodSelected: {
    borderColor: '#2E8B57',
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
  },
  paymentMethodDisabled: {
    opacity: 0.6,
  },
  paymentEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paymentTextSelected: {
    color: '#2E8B57',
    fontWeight: 'bold',
  },
  changeInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '500',
  },
  summary: {
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    padding: 16,
    borderRadius: 8,
  },
  summaryTitle: {
    marginBottom: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemsCount: {
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 4,
  },
  paymentSummary: {
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 4,
  },
  changeSummary: {
    opacity: 0.7,
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  checkoutButton: {
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#CCC',
  },
  checkoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
});