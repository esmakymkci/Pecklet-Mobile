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
import { Mail, Lock, AlertCircle, User } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    }
    
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
  
  const handleRegister = async () => {
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await register(email, password, name);
      router.replace('/');
    } catch (error) {
      // Error is already handled in the store
      console.log('Registration error:', error);
    }
  };
  
  return (
    <AuthLayout>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Pecklet and start learning</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.form}>
        <TextInput
          label="Full Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          error={nameError}
          icon={<User size={20} color={COLORS.darkGray} />}
        />
        
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
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={passwordError}
          icon={<Lock size={20} color={COLORS.darkGray} />}
        />
        
        <TextInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={confirmPasswordError}
          icon={<Lock size={20} color={COLORS.darkGray} />}
        />
        
        <Button
          title="Sign Up"
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading}
          style={styles.registerButton}
          size="lg"
          fullWidth
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
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
  registerButton: {
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
  signInText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});