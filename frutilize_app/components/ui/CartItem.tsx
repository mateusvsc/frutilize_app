import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedView } from '../themed-view';
import { ThemedText } from '../themed-text';
import { CartItem as CartItemType } from '../../types';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/whatsapp';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps): React.JSX.Element {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const itemTotal = product.price * quantity;

  const handleIncrease = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.productInfo}>
        <ThemedText style={styles.emoji}>{product.emoji}</ThemedText>
        <ThemedView style={styles.details}>
          <ThemedText type="defaultSemiBold">{product.name}</ThemedText>
          <ThemedText type="default" style={styles.unit}>
            {formatPrice(product.price)} / {product.unit}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.controls}>
        <ThemedView style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityButton} onPress={handleDecrease}>
            <ThemedText style={styles.quantityButtonText}>-</ThemedText>
          </TouchableOpacity>
          
          <ThemedText style={styles.quantity}>{quantity}</ThemedText>
          
          <TouchableOpacity style={styles.quantityButton} onPress={handleIncrease}>
            <ThemedText style={styles.quantityButtonText}>+</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedText type="defaultSemiBold" style={styles.total}>
          {formatPrice(itemTotal)}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(46, 139, 87, 0.05)',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  unit: {
    marginTop: 4,
    opacity: 0.7,
    fontSize: 14,
  },
  controls: {
    alignItems: 'flex-end',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    backgroundColor: '#2E8B57',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  total: {
    color: '#2E8B57',
  },
});