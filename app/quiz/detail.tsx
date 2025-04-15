import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Share,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Share2 
} from 'lucide-react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

export default function QuizDetailScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const { quizHistory } = useAppStore();
  
  const quiz = quizHistory.find(q => q.id === quizId);
  
  if (!quiz) {
    // Quiz not found, navigate back
    router.replace('/quiz');
    return null;
  }
  
  const correctAnswers = quiz.questions.filter(q => {
    if (Array.isArray(q.correctAnswer)) {
      return q.userAnswer && q.correctAnswer.includes(q.userAnswer as string);
    }
    return q.userAnswer === q.correctAnswer;
  }).length;
  
  const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);
  
  const handleShare = async () => {
    try {
      const message = `I scored ${percentage}% (${correctAnswers}/${quiz.questions.length}) on "${quiz.title}" quiz in WordPecker!`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'My WordPecker Quiz Results',
            text: message
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          alert('Sharing not supported in this browser. Copy this message:\n\n' + message);
        }
      } else {
        await Share.share({
          message: message
        });
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Quiz Results',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.dark} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleShare}>
              <Share2 size={24} color={COLORS.dark} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.quizTitle}>{quiz.title}</Text>
        <Text style={styles.quizDate}>
          {new Date(quiz.completedAt || quiz.createdAt).toLocaleDateString()}
        </Text>
        
        <Card variant="elevated" style={styles.resultsCard}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{percentage}%</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{correctAnswers}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{quiz.questions.length - correctAnswers}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{quiz.questions.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </Card>
        
        <Text style={styles.sectionTitle}>Question Review</Text>
        
        {quiz.questions.map((question, index) => {
          const isCorrect = Array.isArray(question.correctAnswer)
            ? question.userAnswer && question.correctAnswer.includes(question.userAnswer as string)
            : question.userAnswer === question.correctAnswer;
          
          return (
            <Card 
              key={question.id} 
              variant="outlined" 
              style={[
                styles.questionCard,
                isCorrect ? styles.correctQuestionCard : styles.incorrectQuestionCard
              ]}
            >
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Question {index + 1}</Text>
                {isCorrect ? (
                  <CheckCircle size={20} color={COLORS.success} />
                ) : (
                  <XCircle size={20} color={COLORS.error} />
                )}
              </View>
              
              <Text style={styles.questionText}>{question.question}</Text>
              
              {question.type === 'multiple-choice' && question.options && (
                <View style={styles.optionsContainer}>
                  {question.options.map((option, optIndex) => (
                    <View 
                      key={optIndex}
                      style={[
                        styles.optionItem,
                        option === question.userAnswer && styles.selectedOption,
                        option === question.correctAnswer && styles.correctOption,
                        option === question.userAnswer && option !== question.correctAnswer && styles.incorrectOption
                      ]}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          option === question.correctAnswer && styles.correctOptionText,
                          option === question.userAnswer && option !== question.correctAnswer && styles.incorrectOptionText
                        ]}
                      >
                        {option}
                      </Text>
                      {option === question.correctAnswer && (
                        <CheckCircle size={16} color={COLORS.success} />
                      )}
                      {option === question.userAnswer && option !== question.correctAnswer && (
                        <XCircle size={16} color={COLORS.error} />
                      )}
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.answerContainer}>
                <Text style={styles.answerLabel}>Your answer:</Text>
                <Text 
                  style={[
                    styles.answerText,
                    isCorrect ? styles.correctAnswer : styles.incorrectAnswer
                  ]}
                >
                  {question.userAnswer || 'No answer'}
                </Text>
                
                {!isCorrect && (
                  <>
                    <Text style={styles.answerLabel}>Correct answer:</Text>
                    <Text style={[styles.answerText, styles.correctAnswer]}>
                      {Array.isArray(question.correctAnswer) 
                        ? question.correctAnswer.join(', ') 
                        : question.correctAnswer}
                    </Text>
                  </>
                )}
              </View>
            </Card>
          );
        })}
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
  quizTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '700',
    color: COLORS.dark,
  },
  quizDate: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.md,
  },
  resultsCard: {
    marginBottom: THEME.spacing.lg,
    backgroundColor: COLORS.primary,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.white,
  },
  scoreLabel: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.md,
  },
  questionCard: {
    marginBottom: THEME.spacing.md,
  },
  correctQuestionCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  incorrectQuestionCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  questionNumber: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  questionText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
    marginBottom: THEME.spacing.md,
  },
  optionsContainer: {
    marginBottom: THEME.spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.xs,
    backgroundColor: COLORS.lightGray,
  },
  selectedOption: {
    backgroundColor: `${COLORS.primary}15`,
  },
  correctOption: {
    backgroundColor: `${COLORS.success}15`,
  },
  incorrectOption: {
    backgroundColor: `${COLORS.error}15`,
  },
  optionText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.dark,
  },
  correctOptionText: {
    color: COLORS.success,
    fontWeight: '500',
  },
  incorrectOptionText: {
    color: COLORS.error,
    fontWeight: '500',
  },
  answerContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: THEME.spacing.sm,
  },
  answerLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  answerText: {
    fontSize: THEME.typography.fontSizes.md,
    marginBottom: THEME.spacing.sm,
  },
  correctAnswer: {
    color: COLORS.success,
    fontWeight: '500',
  },
  incorrectAnswer: {
    color: COLORS.error,
    fontWeight: '500',
  },
});