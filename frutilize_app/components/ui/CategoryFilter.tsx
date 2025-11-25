import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedView } from '../themed-view';
import { ThemedText } from '../themed-text';

interface Category {
  id: string;
  name: string;
  emoji: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps): React.JSX.Element {
  return (
    <ThemedView style={styles.wrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelectCategory(category.id)}
          >
            <ThemedView 
              style={[
                styles.category,
                selectedCategory === category.id && styles.categorySelected
              ]}
            >
              <ThemedText style={styles.emoji}>{category.emoji}</ThemedText>
              <ThemedText 
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextSelected
                ]}
              >
                {category.name}
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 50, // Garante altura mínima
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
  },
  categorySelected: {
    backgroundColor: '#2E8B57',
  },
  emoji: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: 'white',
  },
});