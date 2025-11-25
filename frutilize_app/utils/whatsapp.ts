import { CartItem, PaymentMethod } from '../types';
import { Linking } from 'react-native';

export const formatPrice = (price: number): string => {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
};

const getPaymentMethodText = (method: PaymentMethod): string => {
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

export const generateOrderMessage = (
  items: CartItem[], 
  total: number, 
  customerData: {
    name: string;
    phone: string;
    address: string;
    neighborhood: string;
    reference?: string;
  },
  paymentMethod: PaymentMethod,
  changeFor?: number
): string => {
  const phoneNumber = '5521968982850';
  
  let message = `🍎 *NOVO PEDIDO - FRUTILIZE* 🛒\n\n`;
  
  message += `*Dados do Cliente:*\n`;
  message += `👤 Nome: ${customerData.name}\n`;
  message += `📱 WhatsApp: ${customerData.phone}\n`;
  message += `🏠 Endereço: ${customerData.address}\n`;
  message += `📍 Bairro: ${customerData.neighborhood}\n`;
  if (customerData.reference) {
    message += `🔍 Referência: ${customerData.reference}\n`;
  }
  
  message += `\n*Forma de Pagamento:*\n`;
  message += `💳 ${getPaymentMethodText(paymentMethod)}\n`;
  if (paymentMethod === 'cash' && changeFor) {
    message += `💰 Troco para: ${formatPrice(changeFor)}\n`;
  }
  
  message += `\n*Itens do Pedido:*\n`;
  
  items.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    message += `${index + 1}. ${item.product.emoji} ${item.product.name} - ${item.quantity} ${item.product.unit} - ${formatPrice(itemTotal)}\n`;
  });
  
  message += `\n*Total do Pedido: ${formatPrice(total)}*\n\n`;
  message += `⏰ Pedido realizado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
  message += `💚 Obrigado pelo pedido! Entraremos em contato para confirmar. 💚`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

export const sendWhatsAppOrder = async (
  items: CartItem[], 
  total: number,
  customerData: {
    name: string;
    phone: string;
    address: string;
    neighborhood: string;
    reference?: string;
  },
  paymentMethod: PaymentMethod,
  changeFor?: number
): Promise<void> => {
  const url = generateOrderMessage(items, total, customerData, paymentMethod, changeFor);
  
  const supported = await Linking.canOpenURL(url);
  
  if (supported) {
    await Linking.openURL(url);
  } else {
    throw new Error('Não foi possível abrir o WhatsApp');
  }
};