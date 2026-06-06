import { useColorScheme } from 'react-native';

export const palette = {
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  red: {
    50: '#fef2f2',
    500: '#ef4444',
  },
  green: {
    500: '#22c55e',
  }
};

export const lightTheme = {
  background: palette.zinc[50],
  foreground: palette.zinc[950],
  card: '#ffffff',
  card_foreground: palette.zinc[950],
  popover: '#ffffff',
  popover_foreground: palette.zinc[950],
  primary: palette.zinc[900],
  primary_foreground: palette.zinc[50],
  secondary: palette.zinc[100],
  secondary_foreground: palette.zinc[900],
  muted: palette.zinc[100],
  muted_foreground: palette.zinc[500],
  accent: palette.zinc[100],
  accent_foreground: palette.zinc[900],
  destructive: palette.red[500],
  destructive_foreground: palette.red[50],
  border: palette.zinc[200],
  input: palette.zinc[200],
  ring: palette.zinc[950],
  radius: 12,
};

export const darkTheme = {
  background: palette.zinc[950],
  foreground: palette.zinc[50],
  card: palette.zinc[950],
  card_foreground: palette.zinc[50],
  popover: palette.zinc[950],
  popover_foreground: palette.zinc[50],
  primary: palette.zinc[50],
  primary_foreground: palette.zinc[900],
  secondary: palette.zinc[800],
  secondary_foreground: palette.zinc[50],
  muted: palette.zinc[800],
  muted_foreground: palette.zinc[400],
  accent: palette.zinc[800],
  accent_foreground: palette.zinc[50],
  destructive: '#7f1d1d',
  destructive_foreground: palette.zinc[50],
  border: palette.zinc[800],
  input: palette.zinc[800],
  ring: palette.zinc[300],
  radius: 12,
};

// Legacy compatibility or single object export
export const Colors = lightTheme;

export const useTheme = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
};
