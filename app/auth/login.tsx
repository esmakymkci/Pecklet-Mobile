import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { COLORS, THEME } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import AuthLayout from '@/components/auth/AuthLayout';
import TextInput from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleLogin = async () => {
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await login(email, password);
      router.replace('/');
    } catch (error) {
      // Error is already handled in the store
      console.log('Login error:', error);
    }
  };
  
  return (
    <AuthLayout>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue learning</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
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
        
        <TextInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={passwordError}
          icon={<Lock size={20} color={COLORS.darkGray} />}
        />
        
        <Link href="/auth/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotPasswordLink}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </Link>
        
        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={styles.loginButton}
          size="lg"
          fullWidth
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/auth/register" asChild>
          <TouchableOpacity>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
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
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: THEME.spacing.lg,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: THEME.typography.fontSizes.sm,
  },
  loginButton: {
    marginTop: THEME.spacing.md,
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
  signUpText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});