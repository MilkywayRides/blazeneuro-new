import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/colors';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) => {
  const theme = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: theme.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'destructive':
        return { backgroundColor: theme.destructive };
      default:
        return { backgroundColor: theme.primary };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.secondary_foreground;
      case 'outline':
      case 'ghost':
        return theme.foreground;
      case 'destructive':
        return theme.destructive_foreground;
      default:
        return theme.primary_foreground;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { height: 36, paddingHorizontal: 12 };
      case 'lg':
        return { height: 56, paddingHorizontal: 32 };
      default:
        return { height: 48, paddingHorizontal: 24 };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        { borderRadius: theme.radius },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
