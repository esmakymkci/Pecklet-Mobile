import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { ArrowLeft, Check, BookOpen, Trophy, Zap, Star, X } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import Button from '@/components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';

export default function PremiumScreen() {
  const router = useRouter();
  
  const handleSubscribe = (plan: string) => {
    // Handle subscription
    console.log(`Subscribe to ${plan} plan`);
    // In a real app, this would integrate with a payment processor
    
    // For demo purposes, just show success and go back
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Premium Subscription',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.dark} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.heroContent}>
            <Star size={40} color={COLORS.white} fill={COLORS.white} />
            <Text style={styles.heroTitle}>Upgrade to Premium</Text>
            <Text style={styles.heroSubtitle}>
              Unlock all features and content
            </Text>
          </View>
        </View>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <BookOpen size={24} color={COLORS.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Unlimited Stories</Text>
              <Text style={styles.featureDescription}>
                Access to 100+ premium stories across all difficulty levels
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Trophy size={24} color={COLORS.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Exclusive Competitions</Text>
              <Text style={styles.featureDescription}>
                Participate in premium competitions with special rewards
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Zap size={24} color={COLORS.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Advanced Learning Tools</Text>
              <Text style={styles.featureDescription}>
                AI-powered vocabulary suggestions and personalized learning paths
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.plansContainer}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          <TouchableOpacity 
            style={[styles.planCard, styles.popularPlan]}
            onPress={() => handleSubscribe('yearly')}
            activeOpacity={0.8}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Best Value</Text>
            </View>
            <Text style={styles.planTitle}>Yearly</Text>
            <Text style={styles.planPrice}>$59.99</Text>
            <Text style={styles.planPricePerMonth}>$4.99/month</Text>
            <Text style={styles.planSavings}>Save 50%</Text>
            <Button
              title="Subscribe"
              onPress={() => handleSubscribe('yearly')}
              style={styles.planButton}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.planCard}
            onPress={() => handleSubscribe('monthly')}
            activeOpacity={0.8}
          >
            <Text style={styles.planTitle}>Monthly</Text>
            <Text style={styles.planPrice}>$9.99</Text>
            <Text style={styles.planPricePerMonth}>Billed monthly</Text>
            <Button
              title="Subscribe"
              onPress={() => handleSubscribe('monthly')}
              variant="outline"
              style={styles.planButton}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.comparisonContainer}>
          <Text style={styles.sectionTitle}>Free vs Premium</Text>
          
          <View style={styles.comparisonTable}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonFeature}>Feature</Text>
              <Text style={styles.comparisonFree}>Free</Text>
              <Text style={styles.comparisonPremium}>Premium</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Stories</Text>
              <Text style={styles.comparisonFree}>5</Text>
              <Text style={styles.comparisonPremium}>100+</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Competitions</Text>
              <Text style={styles.comparisonFree}>Basic</Text>
              <Text style={styles.comparisonPremium}>All</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Daily Word Limit</Text>
              <Text style={styles.comparisonFree}>20</Text>
              <Text style={styles.comparisonPremium}>Unlimited</Text>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>AI Translations</Text>
              <View style={styles.comparisonFreeCell}>
                <X size={16} color={COLORS.error} />
              </View>
              <View style={styles.comparisonPremiumCell}>
                <Check size={16} color={COLORS.success} />
              </View>
            </View>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Offline Access</Text>
              <View style={styles.comparisonFreeCell}>
                <X size={16} color={COLORS.error} />
              </View>
              <View style={styles.comparisonPremiumCell}>
                <Check size={16} color={COLORS.success} />
              </View>
            </View>
          </View>
        </View>
        
        <Text style={styles.guaranteeText}>
          7-day money-back guarantee. Cancel anytime.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: THEME.spacing.xxl,
  },
  heroContainer: {
    height: 200,
    position: 'relative',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  heroTitle: {
    fontSize: THEME.typography.fontSizes.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: THEME.spacing.sm,
  },
  heroSubtitle: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  featuresContainer: {
    padding: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: THEME.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  plansContainer: {
    padding: THEME.spacing.lg,
    paddingTop: 0,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.medium,
    position: 'relative',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: THEME.spacing.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.md,
  },
  popularBadgeText: {
    color: COLORS.white,
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: '600',
  },
  planTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.xs,
  },
  planPrice: {
    fontSize: THEME.typography.fontSizes.xxl,
    fontWeight: '700',
    color: COLORS.dark,
  },
  planPricePerMonth: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.sm,
  },
  planSavings: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: THEME.spacing.md,
  },
  planButton: {
    marginTop: THEME.spacing.sm,
  },
  comparisonContainer: {
    padding: THEME.spacing.lg,
    paddingTop: 0,
  },
  comparisonTable: {
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    ...THEME.shadows.small,
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
  },
  comparisonFeature: {
    flex: 2,
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
    fontWeight: '500',
  },
  comparisonFree: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  comparisonPremium: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  comparisonFreeCell: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonPremiumCell: {
    flex: 1,
    alignItems: 'center',
  },
  guaranteeText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: THEME.spacing.md,
    marginHorizontal: THEME.spacing.lg,
  },
});