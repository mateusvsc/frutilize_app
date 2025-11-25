import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedView } from '../themed-view';
import { ThemedText } from '../themed-text';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/whatsapp';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps): React.JSX.Element {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.productInfo}>
        <ThemedText style={styles.emoji}>{product.emoji}</ThemedText>
        <ThemedView style={styles.details}>
          <ThemedText type="defaultSemiBold" style={styles.name}>
            {product.name}
          </ThemedText>
          <ThemedText type="default" style={styles.price}>
            {formatPrice(product.price)} / {product.unit}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      
      <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
        <ThemedText style={styles.addButtonText}>+</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    minHeight: 60,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 20,
    marginRight: 12,
    minWidth: 24,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    lineHeight: 18,
  },
  price: {
    marginTop: 2,
    opacity: 0.8,
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#2E8B57',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});