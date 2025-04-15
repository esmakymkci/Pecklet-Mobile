import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Alert,
  Share,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  Trophy,
  Share2,
  Timer,
  AlertCircle
} from 'lucide-react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/ui/Button';

// Types for competition questions
type QuestionType = 'multiple-choice' | 'term' | 'character' | 'image' | 'scene';

interface CompetitionQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  timeTaken: number;
  userAnswer?: string;
  imageUrl?: string;
}

export default function CompetitionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { competitions, saveQuiz } = useAppStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [competition, setCompetition] = useState<any>(null);
  const [questions, setQuestions] = useState<CompetitionQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30); // seconds per question
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  
  useEffect(() => {
    const comp = competitions.find(c => c.id === id);
    if (comp) {
      setCompetition(comp);
      
      // Generate mock questions based on the competition theme
      const mockQuestions = generateMockQuestions(comp);
      setQuestions(mockQuestions);
      
      setIsLoading(false);
    } else {
      Alert.alert('Error', 'Competition not found');
      router.back();
    }
  }, [id, competitions, router]);
  
  useEffect(() => {
    if (quizStarted && !quizCompleted && !isAnswerChecked) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleCheckAnswer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [quizStarted, quizCompleted, isAnswerChecked, currentQuestionIndex]);
  
  const generateMockQuestions = (competition: any): CompetitionQuestion[] => {
    // Generate different questions based on the competition theme
    if (competition.title.includes('Breaking Bad')) {
      return [
        {
          id: '1',
          type: 'multiple-choice',
          question: "What is the name of Walter White's alter ego in Breaking Bad?",
          options: ['Heisenberg', 'Hindenburg', 'Heisenbert', 'Heineken'],
          correctAnswer: 'Heisenberg',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '2',
          type: 'term',
          question: "What does the term 'Blue Sky' refer to in Breaking Bad?",
          options: ['The New Mexico sky', 'A car wash brand', "Walter's blue meth", 'A type of mineral'],
          correctAnswer: "Walter's blue meth",
          points: 0,
          timeTaken: 0,
        },
        {
          id: '3',
          type: 'character',
          question: "Who said: 'I am the one who knocks'?",
          options: ['Jesse Pinkman', 'Walter White', 'Hank Schrader', 'Gus Fring'],
          correctAnswer: 'Walter White',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '4',
          type: 'scene',
          question: "In which location did Walter and Jesse first cook meth?",
          options: ['An abandoned warehouse', 'A basement', 'An RV in the desert', "Jesse's house"],
          correctAnswer: 'An RV in the desert',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '5',
          type: 'multiple-choice',
          question: "What was Walter White's profession before becoming a meth cook?",
          options: ['Pharmacist', 'Chemistry teacher', 'Lab technician', 'Doctor'],
          correctAnswer: 'Chemistry teacher',
          points: 0,
          timeTaken: 0,
        },
      ];
    } else if (competition.title.includes('Lord of the Rings')) {
      return [
        {
          id: '1',
          type: 'multiple-choice',
          question: "What is the name of Frodo's home in the Shire?",
          options: ['Bag End', 'Hobbiton Hall', 'Underhill', 'Green Dragon'],
          correctAnswer: 'Bag End',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '2',
          type: 'term',
          question: "What does the Elvish word 'mellon' mean?",
          options: ['Friend', 'Secret', 'Magic', 'Light'],
          correctAnswer: 'Friend',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '3',
          type: 'character',
          question: "Who said: 'You shall not pass!'?",
          options: ['Aragorn', 'Gandalf', 'Elrond', 'Saruman'],
          correctAnswer: 'Gandalf',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '4',
          type: 'scene',
          question: "Where was the Council held to decide the fate of the One Ring?",
          options: ['Minas Tirith', 'Lothlorien', 'Rivendell', 'The Shire'],
          correctAnswer: 'Rivendell',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '5',
          type: 'multiple-choice',
          question: "How many rings of power were given to the race of Men?",
          options: ['Three', 'Seven', 'Nine', 'One'],
          correctAnswer: 'Nine',
          points: 0,
          timeTaken: 0,
        },
      ];
    } else if (competition.title.includes('Stranger Things')) {
      return [
        {
          id: '1',
          type: 'multiple-choice',
          question: "What is the name of the parallel dimension in Stranger Things?",
          options: ['The Other Side', 'The Upside Down', 'The Dark World', 'The Flip Side'],
          correctAnswer: 'The Upside Down',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '2',
          type: 'term',
          question: "What does 'Eleven' call the monster from the Upside Down?",
          options: ['The Beast', 'The Shadow', 'The Demogorgon', 'The Mind Flayer'],
          correctAnswer: 'The Demogorgon',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '3',
          type: 'character',
          question: "What is the full name of the character known as 'Eleven'?",
          options: ['Jane Hopper', 'Jane Ives', 'Jane Brenner', 'Jane Byers'],
          correctAnswer: 'Jane Ives',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '4',
          type: 'scene',
          question: "What game were the boys playing when Will disappeared?",
          options: ['Monopoly', 'Chess', 'Dungeons & Dragons', 'Risk'],
          correctAnswer: 'Dungeons & Dragons',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '5',
          type: 'multiple-choice',
          question: "What is the name of the secret government laboratory in Hawkins?",
          options: ['Hawkins National Laboratory', 'Department of Energy', 'MKUltra Facility', 'Area 51'],
          correctAnswer: 'Hawkins National Laboratory',
          points: 0,
          timeTaken: 0,
        },
      ];
    } else {
      // Generic questions for other competitions
      return [
        {
          id: '1',
          type: 'multiple-choice',
          question: "What is the main setting of this show?",
          options: ['New York', 'Los Angeles', 'Chicago', 'A fictional town'],
          correctAnswer: 'A fictional town',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '2',
          type: 'term',
          question: "What genre would you classify this show as?",
          options: ['Comedy', 'Drama', 'Sci-Fi', 'Horror'],
          correctAnswer: 'Sci-Fi',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '3',
          type: 'character',
          question: "Who is the main protagonist?",
          options: ['Character A', 'Character B', 'Character C', 'Character D'],
          correctAnswer: 'Character A',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '4',
          type: 'scene',
          question: "What is a recurring theme in the show?",
          options: ['Friendship', 'Betrayal', 'Redemption', 'All of the above'],
          correctAnswer: 'All of the above',
          points: 0,
          timeTaken: 0,
        },
        {
          id: '5',
          type: 'multiple-choice',
          question: "How many seasons does the show have?",
          options: ['1-2', '3-4', '5-6', '7+'],
          correctAnswer: '3-4',
          points: 0,
          timeTaken: 0,
        },
      ];
    }
  };
  
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeRemaining(30);
  };
  
  const handleCheckAnswer = () => {
    const timeTaken = 30 - timeRemaining;
    const currentQuestion = questions[currentQuestionIndex];
    
    // Update the question with user's answer and time taken
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: selectedAnswer || 'No answer',
      timeTaken: timeTaken,
    };
    
    setQuestions(updatedQuestions);
    setTotalTimeTaken(prev => prev + timeTaken);
    
    // Calculate points based on correctness and speed
    if (selectedAnswer === currentQuestion.correctAnswer) {
      // Max 100 points per question: 70 for correctness + up to 30 for speed
      const speedPoints = Math.round((30 - Math.min(timeTaken, 30)) / 30 * 30);
      const questionPoints = 70 + speedPoints;
      
      updatedQuestions[currentQuestionIndex].points = questionPoints;
      setScore(prev => prev + questionPoints);
    }
    
    setIsAnswerChecked(true);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setTimeRemaining(30);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      
      // Save quiz results to store
      if (competition) {
        saveQuiz({
          title: `${competition.title} Competition`,
          questions: questions.map(q => ({
            id: q.id,
            type: 'multiple-choice',
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            userAnswer: q.userAnswer,
            points: q.points,
          })),
          score: score,
          totalQuestions: questions.length,
          completedAt: new Date(),
        });
      }
    }
  };
  
  const handleShare = async () => {
    try {
      const message = `I scored ${score} points in the "${competition?.title}" competition on WordPecker! Can you beat my score?`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'My WordPecker Competition Results',
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
  
  const handlePlayAgain = () => {
    // Reset the quiz
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setScore(0);
    setTimeRemaining(30);
    setQuizCompleted(false);
    setTotalTimeTaken(0);
    
    // Reset questions
    const resetQuestions = questions.map(q => ({
      ...q,
      userAnswer: undefined,
      points: 0,
      timeTaken: 0,
    }));
    setQuestions(resetQuestions);
  };
  
  const renderQuestionType = (type: QuestionType) => {
    switch (type) {
      case 'term':
        return 'Terminology';
      case 'character':
        return 'Character Quote';
      case 'image':
        return 'Visual Question';
      case 'scene':
        return 'Scene Knowledge';
      default:
        return 'Multiple Choice';
    }
  };
  
  const renderCurrentQuestion = () => {
    if (questions.length === 0) return null;
    
    const question = questions[currentQuestionIndex];
    
    return (
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionCounter}>
            Question {currentQuestionIndex + 1}/{questions.length}
          </Text>
          <View style={styles.timerContainer}>
            <Timer size={16} color={timeRemaining < 10 ? COLORS.error : COLORS.darkGray} />
            <Text 
              style={[
                styles.timerText,
                timeRemaining < 10 && styles.timerWarning
              ]}
            >
              {timeRemaining}s
            </Text>
          </View>
        </View>
        
        <Badge 
          text={renderQuestionType(question.type)} 
          variant="primary"
          size="md"
          style={styles.questionTypeBadge}
        />
        
        <Card variant="elevated" style={styles.questionCard}>
          <Text style={styles.questionText}>{question.question}</Text>
          
          {question.options && (
            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === option && styles.selectedOption,
                    isAnswerChecked && option === question.correctAnswer && styles.correctOption,
                    isAnswerChecked && selectedAnswer === option && 
                    selectedAnswer !== question.correctAnswer && styles.incorrectOption,
                  ]}
                  onPress={() => !isAnswerChecked && setSelectedAnswer(option)}
                  disabled={isAnswerChecked}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      selectedAnswer === option && styles.selectedOptionText,
                      isAnswerChecked && option === question.correctAnswer && styles.correctOptionText,
                      isAnswerChecked && selectedAnswer === option && 
                      selectedAnswer !== question.correctAnswer && styles.incorrectOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                  
                  {isAnswerChecked && option === question.correctAnswer && (
                    <CheckCircle size={20} color={COLORS.white} />
                  )}
                  
                  {isAnswerChecked && selectedAnswer === option && 
                   selectedAnswer !== question.correctAnswer && (
                    <XCircle size={20} color={COLORS.white} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>
        
        <View style={styles.questionActions}>
          {!isAnswerChecked ? (
            <Button
              title="Submit Answer"
              onPress={handleCheckAnswer}
              disabled={selectedAnswer === null}
              style={styles.actionButton}
            />
          ) : (
            <Button
              title={currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
              onPress={handleNextQuestion}
              style={styles.actionButton}
            />
          )}
        </View>
      </View>
    );
  };
  
  const renderQuizResults = () => {
    const correctAnswers = questions.filter(q => q.userAnswer === q.correctAnswer).length;
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    const averageTimePerQuestion = Math.round(totalTimeTaken / questions.length);
    
    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Competition Complete!</Text>
        
        <Card variant="elevated" style={styles.resultsCard}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{score}</Text>
            <Text style={styles.scoreLabel}>Points</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{averageTimePerQuestion}s</Text>
              <Text style={styles.statLabel}>Avg Time</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{correctAnswers}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.rankContainer}>
          <Text style={styles.rankTitle}>Your Rank</Text>
          <View style={styles.rankCard}>
            <View style={styles.rankHeader}>
              <Trophy size={24} color={COLORS.warning} />
              <Text style={styles.rankText}>
                {score > 350 ? '1st' : score > 250 ? '2nd' : '3rd'} Place
              </Text>
            </View>
            <Text style={styles.rankDescription}>
              You ranked higher than {score > 350 ? '98%' : score > 250 ? '75%' : '50%'} of participants!
            </Text>
          </View>
        </View>
        
        <View style={styles.resultActions}>
          <Button
            title="Share Results"
            onPress={handleShare}
            variant="outline"
            style={styles.resultActionButton}
            icon={<Share2 size={20} color={COLORS.primary} />}
          />
          <Button
            title="Play Again"
            onPress={handlePlayAgain}
            style={styles.resultActionButton}
          />
        </View>
      </View>
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: !quizStarted,
          title: competition?.title || 'Competition',
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
        {!quizStarted ? (
          <>
            <View style={styles.competitionImageContainer}>
              <Image 
                source={{ uri: competition?.imageUrl }}
                style={styles.competitionImage}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
                style={styles.competitionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              <View style={styles.competitionOverlay}>
                <Badge 
                  text={competition?.category} 
                  variant="primary"
                  size="md"
                />
                <Text style={styles.competitionTitle}>{competition?.title}</Text>
                <View style={styles.competitionMeta}>
                  <View style={styles.competitionMetaItem}>
                    <Users size={16} color={COLORS.white} />
                    <Text style={styles.competitionMetaText}>
                      {competition?.participants} participants
                    </Text>
                  </View>
                  <View style={styles.competitionMetaItem}>
                    <Clock size={16} color={COLORS.white} />
                    <Text style={styles.competitionMetaText}>
                      {competition?.duration} min
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <Card variant="outlined" style={styles.infoCard}>
              <Text style={styles.infoTitle}>About this Competition</Text>
              <Text style={styles.infoDescription}>{competition?.description}</Text>
              
              <View style={styles.infoStats}>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatValue}>{questions.length}</Text>
                  <Text style={styles.infoStatLabel}>Questions</Text>
                </View>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatValue}>{competition?.wordCount}</Text>
                  <Text style={styles.infoStatLabel}>Words</Text>
                </View>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatValue}>
                    {new Date(competition?.endDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.infoStatLabel}>Ends</Text>
                </View>
              </View>
            </Card>
            
            <Card variant="outlined" style={styles.rulesCard}>
              <View style={styles.ruleHeader}>
                <AlertCircle size={20} color={COLORS.primary} />
                <Text style={styles.rulesTitle}>Competition Rules</Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>1.</Text>
                <Text style={styles.ruleText}>
                  Each question has a 30-second time limit
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>2.</Text>
                <Text style={styles.ruleText}>
                  Points are awarded based on correctness and speed
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>3.</Text>
                <Text style={styles.ruleText}>
                  You can only take the competition once per day
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>4.</Text>
                <Text style={styles.ruleText}>
                  Your score will be ranked against other participants
                </Text>
              </View>
            </Card>
            
            <Button
              title="Start Competition"
              onPress={handleStartQuiz}
              style={styles.startButton}
            />
          </>
        ) : (
          quizCompleted ? renderQuizResults() : renderCurrentQuestion()
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: THEME.spacing.xxl,
  },
  competitionImageContainer: {
    height: 250,
    position: 'relative',
  },
  competitionImage: {
    width: '100%',
    height: '100%',
  },
  competitionGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  competitionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: THEME.spacing.lg,
  },
  competitionTitle: {
    fontSize: THEME.typography.fontSizes.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginVertical: THEME.spacing.sm,
  },
  competitionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  competitionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  competitionMetaText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.white,
    marginLeft: 4,
  },
  infoCard: {
    margin: THEME.spacing.lg,
  },
  infoTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.sm,
  },
  infoDescription: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.md,
  },
  infoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: THEME.spacing.md,
  },
  infoStatItem: {
    alignItems: 'center',
  },
  infoStatValue: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  infoStatLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  rulesCard: {
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  rulesTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: THEME.spacing.sm,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.sm,
  },
  ruleNumber: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    width: 20,
  },
  ruleText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    flex: 1,
  },
  startButton: {
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
  },
  questionContainer: {
    padding: THEME.spacing.lg,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  questionCounter: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
  },
  timerText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginLeft: 4,
    fontWeight: '500',
  },
  timerWarning: {
    color: COLORS.error,
  },
  questionTypeBadge: {
    marginBottom: THEME.spacing.sm,
  },
  questionCard: {
    marginBottom: THEME.spacing.lg,
  },
  questionText: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.md,
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
  questionActions: {
    marginTop: THEME.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  resultsContainer: {
    padding: THEME.spacing.lg,
  },
  resultsTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
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
  rankContainer: {
    marginBottom: THEME.spacing.lg,
  },
  rankTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.sm,
  },
  rankCard: {
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  rankText: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '700',
    color: COLORS.dark,
    marginLeft: THEME.spacing.sm,
  },
  rankDescription: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.md,
  },
  resultActionButton: {
    flex: 1,
    marginHorizontal: THEME.spacing.xs,
  },
});