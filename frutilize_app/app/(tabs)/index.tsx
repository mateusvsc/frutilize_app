import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import ProductCard from '../../components/ui/ProductCard';
import CategoryFilter from '../../components/ui/CategoryFilter';
import { PRODUCTS, CATEGORIES } from '../../constants/products';

export default function CatalogScreen(): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = PRODUCTS.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>🍎 Frutilize</ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          Frutas e legumes frescos
        </ThemedText>
      </ThemedView>

      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        
        {filteredProducts.length === 0 && (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyEmoji}>🍎</ThemedText>
            <ThemedText type="subtitle" style={styles.emptyText}>
              Nenhum produto encontrado
            </ThemedText>
            <ThemedText type="default" style={styles.emptyDescription}>
              Tente selecionar outra categoria
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.8,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    flex: 1,
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
  },
});