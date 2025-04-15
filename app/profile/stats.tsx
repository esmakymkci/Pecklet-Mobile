import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  Award, 
  BarChart, 
  BookText, 
  GraduationCap 
} from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

export default function StatsScreen() {
  const router = useRouter();
  const { userStats, quizHistory, wordLists } = useAppStore();
  
  // Calculate average quiz score
  const averageScore = userStats.quizzesTaken > 0 
    ? Math.round(userStats.averageScore) 
    : 0;
  
  // Calculate words learned percentage
  const wordsLearnedPercentage = userStats.wordsAdded > 0 
    ? Math.round((userStats.wordsLearned / userStats.wordsAdded) * 100) 
    : 0;
  
  // Get recent activity
  const recentQuizzes = quizHistory.slice(0, 5);
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Statistics',
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
        <Card variant="elevated" style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Learning Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                <BookText size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{userStats.listsCreated}</Text>
              <Text style={styles.statLabel}>Lists Created</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${COLORS.secondary}20` }]}>
                <GraduationCap size={20} color={COLORS.secondary} />
              </View>
              <Text style={styles.statValue}>{userStats.quizzesTaken}</Text>
              <Text style={styles.statLabel}>Quizzes Taken</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${COLORS.success}20` }]}>
                <TrendingUp size={20} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>{userStats.totalXp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.row}>
          <Card variant="elevated" style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeader}>
              <Calendar size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Current Streak</Text>
            </View>
            <Text style={styles.largeValue}>{userStats.streak}</Text>
            <Text style={styles.cardSubtitle}>days</Text>
          </Card>
          
          <Card variant="elevated" style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeader}>
              <Award size={20} color={COLORS.secondary} />
              <Text style={styles.cardTitle}>Level</Text>
            </View>
            <Text style={styles.largeValue}>{userStats.level}</Text>
            <Text style={styles.cardSubtitle}>current level</Text>
          </Card>
        </View>
        
        <Card variant="elevated" style={styles.card}>
          <View style={styles.cardHeader}>
            <BarChart size={20} color={COLORS.info} />
            <Text style={styles.cardTitle}>Quiz Performance</Text>
          </View>
          
          <View style={styles.quizStats}>
            <View style={styles.quizStatItem}>
              <Text style={styles.quizStatValue}>{averageScore}%</Text>
              <Text style={styles.quizStatLabel}>Average Score</Text>
            </View>
            <View style={styles.quizStatDivider} />
            <View style={styles.quizStatItem}>
              <Text style={styles.quizStatValue}>{userStats.quizzesTaken}</Text>
              <Text style={styles.quizStatLabel}>Total Quizzes</Text>
            </View>
          </View>
        </Card>
        
        <Card variant="elevated" style={styles.card}>
          <View style={styles.cardHeader}>
            <BookText size={20} color={COLORS.success} />
            <Text style={styles.cardTitle}>Vocabulary Progress</Text>
          </View>
          
          <View style={styles.vocabStats}>
            <View style={styles.vocabStatItem}>
              <Text style={styles.vocabStatValue}>{userStats.wordsAdded}</Text>
              <Text style={styles.vocabStatLabel}>Words Added</Text>
            </View>
            <View style={styles.vocabStatDivider} />
            <View style={styles.vocabStatItem}>
              <Text style={styles.vocabStatValue}>{userStats.wordsLearned}</Text>
              <Text style={styles.vocabStatLabel}>Words Learned</Text>
            </View>
            <View style={styles.vocabStatDivider} />
            <View style={styles.vocabStatItem}>
              <Text style={styles.vocabStatValue}>{wordsLearnedPercentage}%</Text>
              <Text style={styles.vocabStatLabel}>Completion</Text>
            </View>
          </View>
        </Card>
        
        {recentQuizzes.length > 0 && (
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.sectionTitle}>Recent Quizzes</Text>
            
            {recentQuizzes.map((quiz, index) => (
              <View 
                key={quiz.id} 
                style={[
                  styles.recentQuizItem,
                  index < recentQuizzes.length - 1 && styles.recentQuizItemBorder
                ]}
              >
                <View>
                  <Text style={styles.recentQuizTitle}>{quiz.title}</Text>
                  <Text style={styles.recentQuizDate}>
                    {new Date(quiz.completedAt || quiz.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.recentQuizScore}>
                  <Text 
                    style={[
                      styles.recentQuizScoreText,
                      (quiz.score / quiz.totalQuestions) >= 0.7 
                        ? styles.goodScore 
                        : styles.badScore
                    ]}
                  >
                    {quiz.score}/{quiz.totalQuestions}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}
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
    paddingBottom: THEME.spacing.xxl,
  },
  overviewCard: {
    backgroundColor: COLORS.primary,
    marginBottom: THEME.spacing.md,
  },
  overviewTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: THEME.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  statValue: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  card: {
    marginBottom: THEME.spacing.md,
  },
  halfCard: {
    width: '48%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  cardTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: THEME.spacing.sm,
  },
  largeValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.dark,
  },
  cardSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  quizStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: THEME.spacing.sm,
  },
  quizStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quizStatValue: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '700',
    color: COLORS.dark,
  },
  quizStatLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  quizStatDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.lightGray,
    alignSelf: 'center',
  },
  vocabStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: THEME.spacing.sm,
  },
  vocabStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  vocabStatValue: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '700',
    color: COLORS.dark,
  },
  vocabStatLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  vocabStatDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.lightGray,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.md,
  },
  recentQuizItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  recentQuizItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  recentQuizTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 2,
  },
  recentQuizDate: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  recentQuizScore: {
    alignItems: 'flex-end',
  },
  recentQuizScoreText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
  },
  goodScore: {
    color: COLORS.success,
  },
  badScore: {
    color: COLORS.error,
  },
});