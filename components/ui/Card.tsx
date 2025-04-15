import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, THEME } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const getCardStyle = (): ViewStyle => {
    let cardStyle: ViewStyle = {
      backgroundColor: COLORS.white,
      borderRadius: THEME.borderRadius.lg,
    };
    
    // Variant styles
    switch (variant) {
      case 'default':
        cardStyle = {
          ...cardStyle,
          backgroundColor: COLORS.white,
        };
        break;
      case 'elevated':
        cardStyle = {
          ...cardStyle,
          ...THEME.shadows.medium,
        };
        break;
      case 'outlined':
        cardStyle = {
          ...cardStyle,
          borderWidth: 1,
          borderColor: COLORS.lightGray,
        };
        break;
    }
    
    // Padding styles
    switch (padding) {
      case 'none':
        cardStyle.padding = 0;
        break;
      case 'small':
        cardStyle.padding = THEME.spacing.sm;
        break;
      case 'medium':
        cardStyle.padding = THEME.spacing.md;
        break;
      case 'large':
        cardStyle.padding = THEME.spacing.lg;
        break;
    }
    
    return cardStyle;
  };
  
  return (
    <View style={[styles.card, getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

export default Card;