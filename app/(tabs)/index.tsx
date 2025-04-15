import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import Card from '@/components/ui/Card';
import { FileText, GraduationCap, BookOpen, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { 
    wordLists, 
    userStats, 
    incrementStreak 
  } = useAppStore();
  
  useEffect(() => {
    // Check and update streak when app opens
    incrementStreak();
  }, []);
  
  const navigateTo = (route: string) => {
    router.push(route);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://i.imgur.com/srOMHGd.png' }}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.titleContainer}>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.appName}>Pecklet</Text>
            </View>
          </View>
          <Text style={styles.tagline}>Peck your way to language mastery</Text>
        </View>
        
        <Card variant="elevated" style={styles.statsCard}>
          <Text style={styles.cardTitle}>Your Progress</Text>
          <Text style={styles.cardSubtitle}>Keep up the good work!</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{wordLists.length}</Text>
              <Text style={styles.statLabel}>Lists</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.wordsAdded}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.wordsLearned}</Text>
              <Text style={styles.statLabel}>Learned</Text>
            </View>
          </View>
          
          {userStats.streak > 0 && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>
                🔥 {userStats.streak} day{userStats.streak !== 1 ? 's' : ''} streak
              </Text>
            </View>
          )}
        </Card>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigateTo('/lists/create')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${COLORS.primary}15` }]}>
              <FileText size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Create List</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigateTo('/quiz')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${COLORS.secondary}15` }]}>
              <GraduationCap size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionText}>Start Quiz</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigateTo('/stories')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${COLORS.info}15` }]}>
              <BookOpen size={24} color={COLORS.info} />
            </View>
            <Text style={styles.actionText}>Stories</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigateTo('/profile/stats')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${COLORS.success}15` }]}>
              <TrendingUp size={24} color={COLORS.success} />
            </View>
            <Text style={styles.actionText}>Stats</Text>
          </TouchableOpacity>
        </View>
        
        {wordLists.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Lists</Text>
              <TouchableOpacity onPress={() => navigateTo('/lists')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {wordLists.slice(0, 3).map((list) => (
              <TouchableOpacity 
                key={list.id}
                style={styles.recentListItem}
                onPress={() => navigateTo(`/lists/${list.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle}>{list.title}</Text>
                  <Text style={styles.listMeta}>
                    {list.totalWords} words • {Math.round(list.progress)}% complete
                  </Text>
                </View>
                <View style={styles.progressIndicator}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${list.progress}%` }
                    ]} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>Tip of the day</Text>
          <Text style={styles.tipText}>
            Create word lists from your favorite content to make learning more engaging and relevant to your interests.
          </Text>
        </View>
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
    padding: THEME.spacing.lg,
  },
  header: {
    marginBottom: THEME.spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: THEME.spacing.sm,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  welcomeText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
  },
  appName: {
    fontSize: THEME.typography.fontSizes.xxxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tagline: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
  },
  statsCard: {
    backgroundColor: COLORS.primary,
    marginBottom: THEME.spacing.lg,
  },
  cardTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: THEME.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: THEME.typography.fontSizes.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  streakContainer: {
    marginTop: THEME.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.sm,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.lg,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    alignItems: 'center',
    ...THEME.shadows.small,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  actionText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '500',
    color: COLORS.dark,
  },
  recentSection: {
    marginBottom: THEME.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  seeAllText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  recentListItem: {
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  listInfo: {
    marginBottom: THEME.spacing.sm,
  },
  listTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2,
  },
  listMeta: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  progressIndicator: {
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  tipContainer: {
    backgroundColor: `${COLORS.secondary}15`,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  tipTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.xs,
  },
  tipText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
});