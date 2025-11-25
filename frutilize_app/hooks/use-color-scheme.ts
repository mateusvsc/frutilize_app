import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): NonNullable<ReturnType<typeof useRNColorScheme>> {
  const colorScheme = useRNColorScheme();
  return colorScheme ?? 'light';
}