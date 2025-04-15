import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { 
  GraduationCap, 
  BookOpen, 
  BarChart, 
  ChevronRight,
  Clock,
  Trophy,
  CheckCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

type QuizTab = 'quiz' | 'learning' | 'history';

export default function QuizScreen() {
  const router = useRouter();
  const { quizHistory, learningLevels, userSettings, updateUserSettings } = useAppStore();
  const [activeTab, setActiveTab] = useState<QuizTab>('quiz');
  const [sourceLanguage, setSourceLanguage] = useState(userSettings.defaultSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(userSettings.defaultTargetLanguage);
  
  const handleSourceLanguageChange = (code: string) => {
    setSourceLanguage(code);
    updateUserSettings({ defaultSourceLanguage: code });
  };
  
  const handleTargetLanguageChange = (code: string) => {
    setTargetLanguage(code);
    updateUserSettings({ defaultTargetLanguage: code });
  };
  
  const navigateToQuizStart = () => {
    router.push('/quiz/start');
  };
  
  const navigateToLearningLevel = (levelId: number) => {
    router.push({
      pathname: '/quiz/learning',
      params: { 
        levelId: levelId.toString(),
        sourceLanguage,
        targetLanguage
      }
    });
  };
  
  const navigateToQuizDetail = (quizId: string) => {
    router.push({
      pathname: '/quiz/detail',
      params: { quizId }
    });
  };
  
  const renderHistoryItem = ({ item: quiz }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => navigateToQuizDetail(quiz.id)}
      activeOpacity={0.7}
    >
      <View style={styles.historyItemContent}>
        <Text style={styles.historyItemTitle}>{quiz.title}</Text>
        <View style={styles.historyItemStats}>
          <View style={styles.historyItemStat}>
            <Clock size={14} color={COLORS.darkGray} />
            <Text style={styles.historyItemStatText}>
              {new Date(quiz.completedAt || quiz.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.historyItemStat}>
            <CheckCircle size={14} color={COLORS.darkGray} />
            <Text style={styles.historyItemStatText}>
              {quiz.score}/{quiz.totalQuestions} points
            </Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={COLORS.darkGray} />
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quiz Mode</Text>
        <Text style={styles.subtitle}>Test your vocabulary knowledge</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'quiz' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('quiz')}
        >
          <GraduationCap 
            size={20} 
            color={activeTab === 'quiz' ? COLORS.primary : COLORS.darkGray} 
          />
          <Text 
            style={[
              styles.tabText,
              activeTab === 'quiz' && styles.activeTabText
            ]}
          >
            Quiz
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'learning' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('learning')}
        >
          <BookOpen 
            size={20} 
            color={activeTab === 'learning' ? COLORS.primary : COLORS.darkGray} 
          />
          <Text 
            style={[
              styles.tabText,
              activeTab === 'learning' && styles.activeTabText
            ]}
          >
            Learning
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'history' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('history')}
        >
          <BarChart 
            size={20} 
            color={activeTab === 'history' ? COLORS.primary : COLORS.darkGray} 
          />
          <Text 
            style={[
              styles.tabText,
              activeTab === 'history' && styles.activeTabText
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'quiz' && (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="elevated" style={styles.quizCard}>
            <Text style={styles.cardTitle}>Quick Quiz</Text>
            <Text style={styles.cardDescription}>
              Test your knowledge with a quick quiz from your word lists
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={navigateToQuizStart}
              activeOpacity={0.7}
            >
              <Text style={styles.startButtonText}>Start Quiz</Text>
            </TouchableOpacity>
          </Card>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quiz Options</Text>
          </View>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View style={[styles.optionIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                <Clock size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.optionTitle}>Timed Quiz</Text>
              <Text style={styles.optionDescription}>
                Race against the clock to answer questions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View style={[styles.optionIcon, { backgroundColor: `${COLORS.secondary}15` }]}>
                <Trophy size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.optionTitle}>Challenge</Text>
              <Text style={styles.optionDescription}>
                Compete with others on leaderboards
              </Text>
            </TouchableOpacity>
          </View>
          
          {quizHistory.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Quizzes</Text>
                <TouchableOpacity onPress={() => setActiveTab('history')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {quizHistory.slice(0, 3).map((quiz) => (
                <TouchableOpacity
                  key={quiz.id}
                  style={styles.recentQuizItem}
                  onPress={() => navigateToQuizDetail(quiz.id)}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={styles.recentQuizTitle}>{quiz.title}</Text>
                    <Text style={styles.recentQuizDate}>
                      {new Date(quiz.completedAt || quiz.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.recentQuizScore}>
                    <Text style={styles.recentQuizScoreText}>
                      {quiz.score}/{quiz.totalQuestions}
                    </Text>
                    <Text style={styles.recentQuizScoreLabel}>Score</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      )}
      
      {activeTab === 'learning' && (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="elevated" style={styles.learningCard}>
            <Text style={styles.cardTitle}>Learning Mode</Text>
            <Text style={styles.cardDescription}>
              Master vocabulary step by step with our guided learning path
            </Text>
          </Card>
          
          <View style={styles.languageSelectionContainer}>
            <View style={styles.languageSelectors}>
              <View style={styles.languageSelectorWrapper}>
                <LanguageSelector
                  selectedLanguage={sourceLanguage}
                  onSelectLanguage={handleSourceLanguageChange}
                  label="I speak"
                  excludeLanguages={[targetLanguage]}
                />
              </View>
              <View style={styles.languageSelectorWrapper}>
                <LanguageSelector
                  selectedLanguage={targetLanguage}
                  onSelectLanguage={handleTargetLanguageChange}
                  label="I want to learn"
                  excludeLanguages={[sourceLanguage]}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.learningPathContainer}>
            {learningLevels.map((level, index) => {
              const isConnected = index < learningLevels.length - 1;
              
              return (
                <React.Fragment key={level.id}>
                  <TouchableOpacity
                    style={[
                      styles.levelButton,
                      !level.isUnlocked && styles.lockedLevel
                    ]}
                    onPress={() => level.isUnlocked && navigateToLearningLevel(level.id)}
                    disabled={!level.isUnlocked}
                    activeOpacity={level.isUnlocked ? 0.7 : 1}
                  >
                    <View 
                      style={[
                        styles.levelNumber,
                        level.isCompleted && styles.completedLevelNumber
                      ]}
                    >
                      <Text 
                        style={[
                          styles.levelNumberText,
                          level.isCompleted && styles.completedLevelNumberText
                        ]}
                      >
                        {level.id}
                      </Text>
                    </View>
                    <View style={styles.levelInfo}>
                      <Text style={styles.levelTitle}>{level.title}</Text>
                      <Text style={styles.levelDescription}>
                        {level.wordCount} words
                      </Text>
                      {level.progress > 0 && level.progress < 100 && (
                        <Badge 
                          text={`${Math.round(level.progress)}% complete`}
                          variant="primary"
                          size="sm"
                          style={styles.progressBadge}
                        />
                      )}
                      {level.isCompleted && (
                        <Badge 
                          text="Completed"
                          variant="success"
                          size="sm"
                          style={styles.progressBadge}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  {isConnected && (
                    <View 
                      style={[
                        styles.connector,
                        !learningLevels[index + 1].isUnlocked && styles.lockedConnector
                      ]} 
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </ScrollView>
      )}
      
      {activeTab === 'history' && (
        <View style={styles.content}>
          {quizHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <BarChart size={60} color={`${COLORS.primary}50`} />
              <Text style={styles.emptyHistoryTitle}>No Quiz History</Text>
              <Text style={styles.emptyHistoryText}>
                Take a quiz to see your history and track your progress.
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={navigateToQuizStart}
                activeOpacity={0.7}
              >
                <Text style={styles.startButtonText}>Start Quiz</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={quizHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.historyList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.typography.fontSizes.xxl,
    fontWeight: '700',
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    marginRight: THEME.spacing.lg,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    marginLeft: THEME.spacing.xs,
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: THEME.spacing.lg,
  },
  quizCard: {
    backgroundColor: COLORS.info,
    marginBottom: THEME.spacing.lg,
  },
  learningCard: {
    backgroundColor: COLORS.primary,
    marginBottom: THEME.spacing.lg,
  },
  cardTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: THEME.spacing.xs,
  },
  cardDescription: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: THEME.spacing.md,
  },
  startButton: {
    backgroundColor: COLORS.white,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    color: COLORS.info,
    fontWeight: '600',
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.lg,
  },
  optionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  optionTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  recentQuizItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  recentQuizTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  recentQuizDate: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  recentQuizScore: {
    alignItems: 'center',
  },
  recentQuizScoreText: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  recentQuizScoreLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.darkGray,
  },
  languageSelectionContainer: {
    marginBottom: THEME.spacing.lg,
  },
  languageSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageSelectorWrapper: {
    width: '48%',
  },
  learningPathContainer: {
    alignItems: 'center',
  },
  levelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    width: '100%',
    marginBottom: THEME.spacing.sm,
    ...THEME.shadows.small,
  },
  lockedLevel: {
    opacity: 0.5,
  },
  levelNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  completedLevelNumber: {
    backgroundColor: COLORS.success,
  },
  levelNumberText: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  completedLevelNumberText: {
    color: COLORS.white,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2,
  },
  levelDescription: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  progressBadge: {
    marginTop: 4,
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.primary,
  },
  lockedConnector: {
    backgroundColor: COLORS.lightGray,
  },
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xl,
  },
  emptyHistoryTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  emptyHistoryText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  historyList: {
    padding: THEME.spacing.lg,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  historyItemStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  historyItemStatText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
});