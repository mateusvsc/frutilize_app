import { Product } from '../types';

export const PRODUCTS: Product[] = [
  // 🍎 Frutas
  { id: '1', name: 'Abacate', price: 14.99, category: 'frutas', unit: 'kg', emoji: '🥑', available: true },
  { id: '2', name: 'Abacaxi', price: 5.99, category: 'frutas', unit: 'un', emoji: '🍍', available: true },
  { id: '3', name: 'Ameixa', price: 14.99, category: 'frutas', unit: 'kg', emoji: '🍑', available: true },
  { id: '4', name: 'Amora', price: 5.99, category: 'frutas', unit: 'bdj', emoji: '🫐', available: true },
  { id: '5', name: 'Banana d\'água', price: 5.99, category: 'frutas', unit: 'kg', emoji: '🍌', available: true },
  { id: '6', name: 'Banana ouro', price: 8.99, category: 'frutas', unit: 'kg', emoji: '🍌', available: true },
  { id: '7', name: 'Banana prata', price: 6.99, category: 'frutas', unit: 'kg', emoji: '🍌', available: true },
  { id: '8', name: 'Caju', price: 4.99, category: 'frutas', unit: 'bdj', emoji: '🌰', available: true },
  { id: '9', name: 'Cereja', price: 9.99, category: 'frutas', unit: 'bdj', emoji: '❤', available: true },
  { id: '10', name: 'Coco seco', price: 6.99, category: 'frutas', unit: 'kg', emoji: '🥥', available: true },
  { id: '11', name: 'Coco verde', price: 4.99, category: 'frutas', unit: 'un', emoji: '🥥', available: true },
  { id: '12', name: 'Goiaba', price: 3.99, category: 'frutas', unit: 'bdj', emoji: '🍈', available: true },
  { id: '13', name: 'Kiwi', price: 29.99, category: 'frutas', unit: 'kg', emoji: '🥝', available: true },
  { id: '14', name: 'Laranja lima', price: 7.99, category: 'frutas', unit: 'kg', emoji: '🍊', available: true },
  { id: '15', name: 'Laranja pera', price: 2.99, category: 'frutas', unit: 'kg', emoji: '🍊', available: true },
  { id: '16', name: 'Limão', price: 2.99, category: 'frutas', unit: 'kg', emoji: '🍋', available: true },
  { id: '17', name: 'Maçã argentina', price: 14.99, category: 'frutas', unit: 'kg', emoji: '🍎', available: true },
  { id: '18', name: 'Maçã fuji', price: 14.99, category: 'frutas', unit: 'kg', emoji: '🍎', available: true },
  { id: '19', name: 'Maçã gala', price: 13.99, category: 'frutas', unit: 'kg', emoji: '🍎', available: true },
  { id: '20', name: 'Maçã verde', price: 15.99, category: 'frutas', unit: 'kg', emoji: '🍏', available: true },
  { id: '21', name: 'Mamão formosa', price: 5.99, category: 'frutas', unit: 'kg', emoji: '🍈', available: true },
  { id: '22', name: 'Mamão papaia', price: 2.99, category: 'frutas', unit: 'un', emoji: '⭐', available: true },
  { id: '23', name: 'Manga carlotinha', price: 4.99, category: 'frutas', unit: 'kg', emoji: '🥭', available: true },
  { id: '24', name: 'Manga espada', price: 4.99, category: 'frutas', unit: 'kg', emoji: '🥭', available: true },
  { id: '25', name: 'Maracujá', price: 11.99, category: 'frutas', unit: 'kg', emoji: '🍋', available: true },
  { id: '26', name: 'Melancia', price: 3.99, category: 'frutas', unit: 'kg', emoji: '🍉', available: true },
  { id: '27', name: 'Melancia baby', price: 5.99, category: 'frutas', unit: 'kg', emoji: '🍉', available: true },
  { id: '28', name: 'Melão', price: 5.99, category: 'frutas', unit: 'kg', emoji: '🍈', available: true },
  { id: '29', name: 'Morango', price: 3.99, category: 'frutas', unit: 'bdj', emoji: '🍓', available: true },
  { id: '30', name: 'Pera d\'água', price: 19.99, category: 'frutas', unit: 'kg', emoji: '🍐', available: true },
  { id: '31', name: 'Pêssego', price: 8.99, category: 'frutas', unit: 'kg', emoji: '🍑', available: true },
  { id: '32', name: 'Pinha', price: 3.99, category: 'frutas', unit: 'un', emoji: '🫶🏽', available: true },
  { id: '33', name: 'Tangerina importada', price: 15.99, category: 'frutas', unit: 'kg', emoji: '🧡', available: true },
  { id: '34', name: 'Uva roxa', price: 6.99, category: 'frutas', unit: 'cx', emoji: '🍇', available: true },
  { id: '35', name: 'Uva verde', price: 6.99, category: 'frutas', unit: 'cx', emoji: '🍇', available: true },

  // 🥕 Legumes (apenas alguns exemplos)
  { id: '36', name: 'Abóbora', price: 3.99, category: 'legumes', unit: 'kg', emoji: '🎃', available: true },
  { id: '37', name: 'Abobrinha', price: 0.99, category: 'legumes', unit: 'kg', emoji: '🥒', available: true },
  { id: '38', name: 'Batata doce', price: 1.99, category: 'legumes', unit: 'kg', emoji: '🍠', available: true },
  { id: '39', name: 'Cenoura', price: 2.99, category: 'legumes', unit: 'kg', emoji: '🥕', available: true },
  { id: '40', name: 'Tomate cereja', price: 1.99, category: 'legumes', unit: 'cx', emoji: '🍅', available: true },

  // 🥬 Verduras (apenas alguns exemplos)
  { id: '41', name: 'Alface crespa', price: 1.99, category: 'verduras', unit: 'un', emoji: '🥬', available: true },
  { id: '42', name: 'Rúcula', price: 1.99, category: 'verduras', unit: 'un', emoji: '🌿', available: true },

  // 🥤 Bebidas
  { id: '43', name: 'Água c/ gás', price: 2.99, category: 'bebidas', unit: '500ml', emoji: '💧', available: true },
  { id: '44', name: 'Coca-cola 2L', price: 11.99, category: 'bebidas', unit: 'un', emoji: '🥤', available: true },
  { id: '45', name: 'Água de coco', price: 4.99, category: 'bebidas', unit: '500ml', emoji: '🥥', available: true },

  // 🛒 Outros
  { id: '46', name: 'Ovos brancos', price: 8.99, category: 'outros', unit: 'dúzia', emoji: '🥚', available: true },
  { id: '47', name: 'Mel', price: 4.99, category: 'outros', unit: '250ml', emoji: '🍯', available: true },
];

export const CATEGORIES = [
  { id: 'all', name: 'Todos', emoji: '🛒' },
  { id: 'frutas', name: 'Frutas', emoji: '🍎' },
  { id: 'legumes', name: 'Legumes', emoji: '🥕' },
  { id: 'verduras', name: 'Verduras', emoji: '🥬' },
  { id: 'bebidas', name: 'Bebidas', emoji: '🥤' },
  { id: 'outros', name: 'Outros', emoji: '🛒' },
];