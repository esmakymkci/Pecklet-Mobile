import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, THEME } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import AuthLayout from '@/components/auth/AuthLayout';
import TextInput from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setPasswordError('');
    setConfirmPasswordError('');
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleResetPassword = async () => {
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    if (!token) {
      Alert.alert('Error', 'Reset token is missing');
      return;
    }
    
    try {
      await resetPassword(token.toString(), password);
      setIsSuccess(true);
    } catch (error) {
      // Error is already handled in the store
      console.log('Reset password error:', error);
    }
  };
  
  return (
    <AuthLayout>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={COLORS.dark} />
      </TouchableOpacity>
      
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        {isSuccess 
          ? "Your password has been reset successfully" 
          : "Create a new password for your account"}
      </Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {isSuccess ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            Your password has been reset successfully. You can now log in with your new password.
          </Text>
          <Button
            title="Go to Login"
            onPress={() => router.replace('/auth/login')}
            style={styles.loginButton}
            size="lg"
            fullWidth
          />
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            label="New Password"
            placeholder="Enter new password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError}
            icon={<Lock size={20} color={COLORS.darkGray} />}
          />
          
          <TextInput
            label="Confirm Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={confirmPasswordError}
            icon={<Lock size={20} color={COLORS.darkGray} />}
          />
          
          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={isLoading}
            style={styles.resetButton}
            size="lg"
            fullWidth
          />
        </View>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: THEME.spacing.sm,
  },
  title: {
    fontSize: THEME.typography.fontSizes.xxl,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: THEME.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.lg,
    textAlign: 'center',
  },
  form: {
    marginTop: THEME.spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.error}15`,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
  },
  errorText: {
    color: COLORS.error,
    marginLeft: THEME.spacing.sm,
    flex: 1,
  },
  successContainer: {
    marginTop: THEME.spacing.xl,
    alignItems: 'center',
  },
  successText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
  },
  resetButton: {
    marginTop: THEME.spacing.md,
  },
  loginButton: {
    marginTop: THEME.spacing.xl,
  },
});