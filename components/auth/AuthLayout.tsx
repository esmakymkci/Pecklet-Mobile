import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const { height, width } = Dimensions.get('window');

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  // Animation values
  const logoPosition = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  
  // Calculate positions
  const initialLogoPosition = height * 0.35; // Center position
  const finalLogoPosition = height * 0.08; // Top position (moved higher to avoid overlap)
  
  // Logo scale animation
  const logoScale = logoPosition.interpolate({
    inputRange: [0, initialLogoPosition - finalLogoPosition],
    outputRange: [1.2, 0.85], // Scale down a bit more
    extrapolate: 'clamp'
  });
  
  useEffect(() => {
    // Start animations after a short delay
    const animationTimeout = setTimeout(() => {
      // Sequence of animations
      Animated.sequence([
        // 1. Move logo from center to top
        Animated.timing(logoPosition, {
          toValue: initialLogoPosition - finalLogoPosition,
          duration: 800,
          useNativeDriver: true,
        }),
        // 2. Fade in the form
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start();
    }, 500); // Short delay before animation starts
    
    return () => clearTimeout(animationTimeout);
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>
            {/* Animated Logo */}
            <Animated.View 
              style={[
                styles.logoContainer,
                {
                  transform: [
                    { translateY: Animated.multiply(logoPosition, -1) },
                    { scale: logoScale }
                  ]
                }
              ]}
            >
              <Image
                source={{ uri: 'https://i.imgur.com/Xns8O85.jpeg' }}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
            
            {/* Animated Form Container */}
            <Animated.View 
              style={[
                styles.formContainer,
                { opacity: formOpacity }
              ]}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: THEME.spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: height * 0.35, // Initial center position
    zIndex: 10,
  },
  logo: {
    width: 110, // Slightly smaller logo
    height: 110,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    width: width * 0.9,
    maxWidth: 400,
    marginTop: height * 0.22, // Increased margin to avoid overlap with logo
    ...THEME.shadows.medium,
  },
});

export default AuthLayout;