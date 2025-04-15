import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Volume2,
  ChevronRight
} from 'lucide-react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getLanguageFlag, getLanguageName } from '@/constants/languages';
import { generateLearningContent } from '@/services/gemini-service';

interface LearningWord {
  original: string;
  translation: string;
  pronunciation?: string;
  examples: string[];
  learned: boolean;
}

type LearningStep = 'intro' | 'learning' | 'practice' | 'complete';

export default function LearningScreen() {
  const router = useRouter();
  const { 
    levelId = '1', 
    sourceLanguage = 'en', 
    targetLanguage = 'es' 
  } = useLocalSearchParams<{ 
    levelId: string; 
    sourceLanguage: string; 
    targetLanguage: string; 
  }>();
  
  const { 
    learningLevels, 
    updateLevelProgress, 
    completeLevel 
  } = useAppStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [words, setWords] = useState<LearningWord[]>([]);
  const [currentStep, setCurrentStep] = useState<LearningStep>('intro');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const level = learningLevels.find(l => l.id === parseInt(levelId)) || learningLevels[0];
  
  useEffect(() => {
    loadLearningContent();
  }, []);
  
  const loadLearningContent = async () => {
    setIsLoading(true);
    
    try {
      const content = await generateLearningContent(
        parseInt(levelId),
        sourceLanguage,
        targetLanguage
      );
      
      if (content.words && content.words.length > 0) {
        const learningWords: LearningWord[] = content.words.map(word => ({
          ...word,
          learned: false,
        }));
        
        setWords(learningWords);
        generatePracticeQuestions(learningWords);
      } else {
        throw new Error('Failed to generate learning content');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load learning content. Please try again.'
      );
      router.back();
    } finally {
      setIsLoading(false);
    }
  };
  
  const generatePracticeQuestions = (learningWords: LearningWord[]) => {
    // Generate multiple choice questions
    const questions = learningWords.map(word => {
      // Get 3 random incorrect options
      const incorrectOptions = learningWords
        .filter(w => w.translation !== word.translation)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.translation);
      
      // Add correct answer and shuffle
      const options = [...incorrectOptions, word.translation]
        .sort(() => 0.5 - Math.random());
      
      return {
        type: 'multiple-choice',
        question: `What is the translation of "${word.original}"?`,
        options,
        correctAnswer: word.translation,
      };
    });
    
    // Shuffle questions
    setPracticeQuestions(questions.sort(() => 0.5 - Math.random()));
  };
  
  const handleNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowTranslation(false);
    } else {
      // Move to practice step
      setCurrentStep('practice');
      updateLevelProgress(level.id, 50); // 50% progress after learning
    }
  };
  
  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }
    
    setIsAnswerChecked(true);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      // Complete the learning session
      setCurrentStep('complete');
      
      // Calculate final progress based on correct answers
      const progress = Math.round((correctAnswers / practiceQuestions.length) * 100);
      
      if (progress >= 70) {
        // Mark level as completed if score is 70% or higher
        completeLevel(level.id);
      } else {
        // Update progress
        updateLevelProgress(level.id, progress);
      }
    }
  };
  
  const handleFinish = () => {
    router.replace('/quiz');
  };
  
  const renderIntroStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Level {level.id}: {level.title}</Text>
      <Text style={styles.stepDescription}>
        You'll learn {level.wordCount} new words in this level.
      </Text>
      
      <Card variant="elevated" style={styles.infoCard}>
        <View style={styles.languageContainer}>
          <Text style={styles.languageText}>
            {getLanguageFlag(sourceLanguage)} {getLanguageName(sourceLanguage)}
          </Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.languageText}>
            {getLanguageFlag(targetLanguage)} {getLanguageName(targetLanguage)}
          </Text>
        </View>
        
        <Text style={styles.infoText}>
          Tap on words to reveal their translation. After learning all words, 
          you'll practice with a short quiz.
        </Text>
      </Card>
      
      <Button
        title="Start Learning"
        onPress={() => setCurrentStep('learning')}
        style={styles.actionButton}
      />
    </View>
  );
  
  const renderLearningStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Word {currentWordIndex + 1}/{words.length}
        </Text>
        <ProgressBar 
          progress={(currentWordIndex / words.length) * 100} 
          style={styles.progressBar}
        />
      </View>
      
      <Card variant="elevated" style={styles.wordCard}>
        <Text style={styles.originalWord}>
          {words[currentWordIndex].original}
        </Text>
        
        {!showTranslation ? (
          <TouchableOpacity
            style={styles.revealButton}
            onPress={() => setShowTranslation(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.revealButtonText}>Tap to reveal translation</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.translationContainer}>
            <Text style={styles.translationWord}>
              {words[currentWordIndex].translation}
            </Text>
            
            {words[currentWordIndex].pronunciation && (
              <View style={styles.pronunciationContainer}>
                <Text style={styles.pronunciation}>
                  /{words[currentWordIndex].pronunciation}/
                </Text>
                <TouchableOpacity style={styles.audioButton}>
                  <Volume2 size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
            
            {words[currentWordIndex].examples && words[currentWordIndex].examples.length > 0 && (
              <View style={styles.examplesContainer}>
                <Text style={styles.examplesTitle}>Examples:</Text>
                {words[currentWordIndex].examples.map((example, index) => (
                  <Text key={index} style={styles.example}>
                    • {example}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </Card>
      
      <Button
        title={currentWordIndex < words.length - 1 ? "Next Word" : "Start Practice"}
        onPress={handleNextWord}
        disabled={!showTranslation}
        style={styles.actionButton}
      />
    </View>
  );
  
  const renderPracticeStep = () => {
    const currentQuestion = practiceQuestions[currentQuestionIndex];
    
    return (
      <View style={styles.stepContainer}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1}/{practiceQuestions.length}
          </Text>
          <ProgressBar 
            progress={(currentQuestionIndex / practiceQuestions.length) * 100} 
            style={styles.progressBar}
          />
        </View>
        
        <Card variant="elevated" style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === option && styles.selectedOption,
                  isAnswerChecked && option === currentQuestion.correctAnswer && styles.correctOption,
                  isAnswerChecked && selectedAnswer === option && 
                  selectedAnswer !== currentQuestion.correctAnswer && styles.incorrectOption,
                ]}
                onPress={() => !isAnswerChecked && setSelectedAnswer(option)}
                disabled={isAnswerChecked}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.optionText,
                    selectedAnswer === option && styles.selectedOptionText,
                    isAnswerChecked && option === currentQuestion.correctAnswer && styles.correctOptionText,
                    isAnswerChecked && selectedAnswer === option && 
                    selectedAnswer !== currentQuestion.correctAnswer && styles.incorrectOptionText,
                  ]}
                >
                  {option}
                </Text>
                
                {isAnswerChecked && option === currentQuestion.correctAnswer && (
                  <CheckCircle size={20} color={COLORS.white} />
                )}
                
                {isAnswerChecked && selectedAnswer === option && 
                 selectedAnswer !== currentQuestion.correctAnswer && (
                  <XCircle size={20} color={COLORS.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>
        
        {!isAnswerChecked ? (
          <Button
            title="Check Answer"
            onPress={handleCheckAnswer}
            disabled={selectedAnswer === null}
            style={styles.actionButton}
          />
        ) : (
          <Button
            title={currentQuestionIndex < practiceQuestions.length - 1 ? "Next Question" : "Complete"}
            onPress={handleNextQuestion}
            style={styles.actionButton}
          />
        )}
      </View>
    );
  };
  
  const renderCompleteStep = () => {
    const score = Math.round((correctAnswers / practiceQuestions.length) * 100);
    const isPassed = score >= 70;
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Level Complete!</Text>
        
        <Card 
          variant="elevated" 
          style={[
            styles.resultCard,
            isPassed ? styles.passedCard : styles.failedCard
          ]}
        >
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{score}%</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
          
          <Text style={styles.resultText}>
            {isPassed 
              ? `Congratulations! You've completed Level ${level.id}!` 
              : "Keep practicing! You need 70% to pass the level."}
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{correctAnswers}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{practiceQuestions.length - correctAnswers}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{practiceQuestions.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </Card>
        
        {isPassed && level.id < learningLevels.length && (
          <TouchableOpacity
            style={styles.nextLevelButton}
            onPress={() => {
              router.replace({
                pathname: '/quiz/learning',
                params: {
                  levelId: (level.id + 1).toString(),
                  sourceLanguage,
                  targetLanguage
                }
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.nextLevelText}>Continue to Level {level.id + 1}</Text>
            <ChevronRight size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
        
        <Button
          title={isPassed ? "Finish" : "Try Again"}
          onPress={isPassed ? handleFinish : () => {
            setCurrentStep('learning');
            setCurrentWordIndex(0);
            setShowTranslation(false);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setIsAnswerChecked(false);
            setCorrectAnswers(0);
          }}
          style={styles.actionButton}
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: `Level ${level.id}: ${level.title}`,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.dark} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading learning content...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 'intro' && renderIntroStep()}
          {currentStep === 'learning' && renderLearningStep()}
          {currentStep === 'practice' && renderPracticeStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: THEME.spacing.xs,
  },
  stepDescription: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.lg,
  },
  infoCard: {
    marginBottom: THEME.spacing.lg,
    backgroundColor: COLORS.primary,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  languageText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.white,
  },
  arrow: {
    marginHorizontal: THEME.spacing.sm,
    color: COLORS.white,
  },
  infoText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 22,
  },
  actionButton: {
    marginTop: THEME.spacing.lg,
  },
  progressContainer: {
    marginBottom: THEME.spacing.md,
  },
  progressText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.xs,
  },
  progressBar: {
    height: 6,
  },
  wordCard: {
    padding: THEME.spacing.lg,
  },
  originalWord: {
    fontSize: THEME.typography.fontSizes.xxl,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  revealButton: {
    backgroundColor: `${COLORS.primary}15`,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  revealButtonText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  translationContainer: {
    alignItems: 'center',
  },
  translationWord: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: THEME.spacing.sm,
  },
  pronunciationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  pronunciation: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    fontStyle: 'italic',
    marginRight: THEME.spacing.sm,
  },
  audioButton: {
    padding: 4,
  },
  examplesContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: THEME.spacing.md,
  },
  examplesTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.sm,
  },
  example: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    marginBottom: 8,
    lineHeight: 22,
  },
  questionCard: {
    padding: THEME.spacing.lg,
  },
  questionText: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.lg,
  },
  optionsContainer: {
    marginTop: THEME.spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  correctOption: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success,
  },
  incorrectOption: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error,
  },
  optionText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  correctOptionText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  incorrectOptionText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  resultCard: {
    padding: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  passedCard: {
    backgroundColor: COLORS.success,
  },
  failedCard: {
    backgroundColor: COLORS.error,
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
  resultText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  nextLevelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    marginTop: THEME.spacing.md,
  },
  nextLevelText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: THEME.spacing.xs,
  },
});