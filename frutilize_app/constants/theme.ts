export const Colors = {
  light: {
    text: '#1A3C34',
    background: '#FFFFFF',
    tint: '#2E8B57',
    icon: '#4A7C59',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#2E8B57',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F1F1A',
    tint: '#4CAF50',
    icon: '#A5D6A7',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#4CAF50',
  },
};

export type Theme = typeof Colors.light | typeof Colors.dark;