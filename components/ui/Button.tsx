import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { COLORS, THEME } from '@/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  ...rest
}) => {
  const getButtonStyle = (): ViewStyle => {
    let buttonStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: COLORS.primary,
          borderWidth: 0,
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: COLORS.secondary,
          borderWidth: 0,
        };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary,
        };
        break;
      case 'ghost':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
        break;
    }
    
    // Size styles
    switch (size) {
      case 'sm':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: THEME.borderRadius.md,
        };
        break;
      case 'md':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: THEME.borderRadius.md,
        };
        break;
      case 'lg':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: THEME.borderRadius.md,
        };
        break;
    }
    
    // Width style
    if (fullWidth) {
      buttonStyle.width = '100%';
    }
    
    // Disabled style
    if (disabled || loading) {
      buttonStyle.opacity = 0.6;
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = (): TextStyle => {
    let textStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };
    
    // Size styles
    switch (size) {
      case 'sm':
        textStyle.fontSize = 14;
        break;
      case 'md':
        textStyle.fontSize = 16;
        break;
      case 'lg':
        textStyle.fontSize = 18;
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'primary':
      case 'secondary':
        textStyle.color = COLORS.white;
        break;
      case 'outline':
        textStyle.color = COLORS.primary;
        break;
      case 'ghost':
        textStyle.color = COLORS.primary;
        break;
    }
    
    return textStyle;
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, getButtonStyle(), style]}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={[styles.text, getTextStyle(), textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
  },
});

export default Button;