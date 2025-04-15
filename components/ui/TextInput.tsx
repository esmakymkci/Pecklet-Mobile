import React, { useState } from 'react';
import { 
  View, 
  TextInput as RNTextInput, 
  Text, 
  StyleSheet, 
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { COLORS, THEME } from '@/constants/colors';
import { Eye, EyeOff } from 'lucide-react-native';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  secureTextEntry?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  icon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  secureTextEntry,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const handleFocus = () => {
    setIsFocused(true);
    if (rest.onFocus) {
      rest.onFocus();
    }
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur();
    }
  };
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.focusedInput,
        error && styles.errorInput,
      ]}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        
        <RNTextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            secureTextEntry && styles.inputWithToggle,
            inputStyle,
          ]}
          placeholderTextColor={COLORS.mediumGray}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...rest}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={COLORS.darkGray} />
            ) : (
              <Eye size={20} color={COLORS.darkGray} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: '500',
    marginBottom: 6,
    color: COLORS.dark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: COLORS.white,
  },
  focusedInput: {
    borderColor: COLORS.primary,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  iconContainer: {
    paddingLeft: THEME.spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: THEME.spacing.md,
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  inputWithIcon: {
    paddingLeft: THEME.spacing.sm,
  },
  inputWithToggle: {
    paddingRight: THEME.spacing.xl,
  },
  toggleButton: {
    position: 'absolute',
    right: THEME.spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.error,
    marginTop: 4,
  },
});

export default TextInput;