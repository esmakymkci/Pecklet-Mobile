import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { COLORS, THEME } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import AuthLayout from '@/components/auth/AuthLayout';
import TextInput from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleForgotPassword = async () => {
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      // Error is already handled in the store
      console.log('Forgot password error:', error);
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
      
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        {isSubmitted 
          ? "Check your email for reset instructions" 
          : "Enter your email to reset your password"}
      </Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {isSubmitted ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            We've sent password reset instructions to {email}
          </Text>
          <Button
            title="Back to Login"
            onPress={() => router.replace('/auth/login')}
            style={styles.backToLoginButton}
            size="lg"
            fullWidth
          />
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            icon={<Mail size={20} color={COLORS.darkGray} />}
          />
          
          <Button
            title="Reset Password"
            onPress={handleForgotPassword}
            loading={isLoading}
            disabled={isLoading}
            style={styles.resetButton}
            size="lg"
            fullWidth
          />
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Remember your password?</Text>
        <Link href="/auth/login" asChild>
          <TouchableOpacity>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
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
  backToLoginButton: {
    marginTop: THEME.spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: THEME.spacing.xl,
  },
  footerText: {
    color: COLORS.darkGray,
    marginRight: THEME.spacing.xs,
  },
  signInText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});