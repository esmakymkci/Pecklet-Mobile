import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, THEME } from '@/constants/colors';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    let badgeStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'default':
        badgeStyle = {
          backgroundColor: COLORS.lightGray,
        };
        break;
      case 'primary':
        badgeStyle = {
          backgroundColor: `${COLORS.primary}20`,
        };
        break;
      case 'secondary':
        badgeStyle = {
          backgroundColor: `${COLORS.secondary}20`,
        };
        break;
      case 'success':
        badgeStyle = {
          backgroundColor: `${COLORS.success}20`,
        };
        break;
      case 'error':
        badgeStyle = {
          backgroundColor: `${COLORS.error}20`,
        };
        break;
      case 'warning':
        badgeStyle = {
          backgroundColor: `${COLORS.warning}20`,
        };
        break;
      case 'info':
        badgeStyle = {
          backgroundColor: `${COLORS.info}20`,
        };
        break;
    }
    
    // Size styles
    switch (size) {
      case 'sm':
        badgeStyle = {
          ...badgeStyle,
          paddingVertical: 2,
          paddingHorizontal: 6,
          borderRadius: THEME.borderRadius.sm,
        };
        break;
      case 'md':
        badgeStyle = {
          ...badgeStyle,
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: THEME.borderRadius.md,
        };
        break;
      case 'lg':
        badgeStyle = {
          ...badgeStyle,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: THEME.borderRadius.md,
        };
        break;
    }
    
    return badgeStyle;
  };
  
  const getTextStyle = (): TextStyle => {
    let textStyleObj: TextStyle = {
      fontWeight: '500',
    };
    
    // Size styles
    switch (size) {
      case 'sm':
        textStyleObj.fontSize = 10;
        break;
      case 'md':
        textStyleObj.fontSize = 12;
        break;
      case 'lg':
        textStyleObj.fontSize = 14;
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'default':
        textStyleObj.color = COLORS.darkGray;
        break;
      case 'primary':
        textStyleObj.color = COLORS.primary;
        break;
      case 'secondary':
        textStyleObj.color = COLORS.secondary;
        break;
      case 'success':
        textStyleObj.color = COLORS.success;
        break;
      case 'error':
        textStyleObj.color = COLORS.error;
        break;
      case 'warning':
        textStyleObj.color = COLORS.warning;
        break;
      case 'info':
        textStyleObj.color = COLORS.info;
        break;
    }
    
    return textStyleObj;
  };
  
  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={[styles.text, getTextStyle(), textStyle]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    textAlign: 'center',
  },
});

export default Badge;