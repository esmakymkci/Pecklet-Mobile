import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput as RNTextInput,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle,
  XCircle,
  ChevronRight,
  BookText
} from 'lucide-react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getLanguageFlag, getLanguageName } from '@/constants/languages';
import { generateQuiz } from '@/services/gemini-service';
import { QuizQuestion } from '@/types';

export default function QuizStartScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams<{ listId?: string }>();
  const { 
    wordLists, 
    userSettings,
    saveQuiz
  } = useAppStore();
  
  const [selectedListId, setSelectedListId] = useState<string | null>(listId || null);
  const [sourceLanguage, setSourceLanguage] = useState(userSettings.defaultSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(userSettings.defaultTargetLanguage);
  const [questionCount, setQuestionCount] = useState(7);
  const [isTimeLimited, setIsTimeLimited] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60); // seconds
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const selectedList = selectedListId 
    ? wordLists.find(list => list.id === selectedListId)
    : null;
  
  const availableLists = wordLists.filter(list => list.words.length >= 3);
  
  useEffect(() => {
    if (isTimeLimited && currentStep === 2 && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNextQuestion();
            return timeLimit;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isTimeLimited, currentStep, currentQuestionIndex, quizCompleted]);
  
  const handleSourceLanguageChange = (code: string) => {
    setSourceLanguage(code);
  };
  
  const handleTargetLanguageChange = (code: string) => {
    setTargetLanguage(code);
  };
  
  const handleSelectList = (id: string) => {
    setSelectedListId(id);
    
    const list = wordLists.find(list => list.id === id);
    if (list) {
      setSourceLanguage(list.sourceLanguage);
      setTargetLanguage(list.targetLanguage);
    }
  };
  
  const handleStartQuiz = async () => {
    if (selectedListId) {
      const list = wordLists.find(list => list.id === selectedListId);
      
      if (!list || list.words.length < 3) {
        Alert.alert(
          'Not Enough Words',
          'The selected list needs at least 3 words to generate a quiz.'
        );
        return;
      }
      
      setIsGenerating(true);
      
      try {
        // Get random words from the list
        const shuffledWords = [...list.words].sort(() => 0.5 - Math.random());
        const selectedWords = shuffledWords.slice(0, Math.min(questionCount, shuffledWords.length));
        
        const wordPairs = selectedWords.map(word => ({
          original: word.original,
          translation: word.translation
        }));
        
        const quizData = await generateQuiz(
          wordPairs,
          list.sourceLanguage,
          list.targetLanguage
        );
        
        if (quizData.questions && quizData.questions.length > 0) {
          const formattedQuestions: QuizQuestion[] = quizData.questions.map((q, index) => ({
            id: `q-${index}`,
            type: q.type as any,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: 10,
          }));
          
          setQuestions(formattedQuestions);
          setCurrentStep(2);
          setTimeRemaining(timeLimit);
        } else {
          throw new Error('Failed to generate quiz questions');
        }
      } catch (error) {
        console.error('Quiz generation error:', error);
        Alert.alert(
          'Error',
          'Failed to generate quiz. Please try again.'
        );
      } finally {
        setIsGenerating(false);
      }
    } else if (currentStep === 0) {
      // No list selected, move to custom quiz
      setCurrentStep(1);
    } else {
      // Custom quiz without a list
      setIsGenerating(true);
      
      try {
        // For custom quiz, we'll generate generic questions based on the selected languages
        const quizData = await generateQuiz(
          [], // No specific words
          sourceLanguage,
          targetLanguage,
          true // Flag to indicate this is a generic quiz
        );
        
        if (quizData.questions && quizData.questions.length > 0) {
          const formattedQuestions: QuizQuestion[] = quizData.questions.map((q, index) => ({
            id: `q-${index}`,
            type: q.type as any,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: 10,
          }));
          
          setQuestions(formattedQuestions);
          setCurrentStep(2);
          setTimeRemaining(timeLimit);
        } else {
          throw new Error('Failed to generate quiz questions');
        }
      } catch (error) {
        console.error('Quiz generation error:', error);
        Alert.alert(
          'Error',
          'Failed to generate quiz. Please try again.'
        );
      } finally {
        setIsGenerating(false);
      }
    }
  };
  
  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;
    
    if (Array.isArray(currentQuestion.correctAnswer)) {
      isCorrect = currentQuestion.correctAnswer.includes(selectedAnswer);
    } else {
      isCorrect = selectedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    }
    
    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }
    
    // Update the question with user's answer
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: selectedAnswer,
    };
    setQuestions(updatedQuestions);
    
    setIsAnswerChecked(true);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setTimeRemaining(timeLimit);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      
      // Save quiz results
      saveQuiz({
        title: selectedList 
          ? `Quiz on ${selectedList.title}`
          : 'Custom Quiz',
        listId: selectedListId || undefined,
        questions,
        score,
        totalQuestions: questions.length,
        completedAt: new Date(),
      });
    }
  };
  
  const handleFinishQuiz = () => {
    router.replace('/quiz');
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
          {isTimeLimited && (
            <View style={styles.timerContainer}>
              <Clock size={16} color={COLORS.darkGray} />
              <Text style={styles.timerText}>{timeRemaining}s</Text>
            </View>
          )}
        </View>
        
        <Card variant="elevated" style={styles.questionCard}>
          <Text style={styles.questionText}>{question.question}</Text>
          
          {question.type === 'multiple-choice' && question.options && (
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
          
          {question.type === 'fill-blank' && (
            <View style={styles.fillBlankContainer}>
              <RNTextInput
                placeholder="Type your answer..."
                value={selectedAnswer || ''}
                onChangeText={text => !isAnswerChecked && setSelectedAnswer(text)}
                editable={!isAnswerChecked}
                style={[
                  styles.fillBlankInput,
                  isAnswerChecked && selectedAnswer?.toLowerCase() === question.correctAnswer.toLowerCase() && styles.correctFillBlank,
                  isAnswerChecked && selectedAnswer?.toLowerCase() !== question.correctAnswer.toLowerCase() && styles.incorrectFillBlank,
                ]}
              />
              
              {isAnswerChecked && selectedAnswer?.toLowerCase() !== question.correctAnswer.toLowerCase() && (
                <Text style={styles.correctAnswerText}>
                  Correct answer: {question.correctAnswer}
                </Text>
              )}
            </View>
          )}
          
          {question.type === 'true-false' && (
            <View style={styles.trueFalseContainer}>
              <TouchableOpacity
                style={[
                  styles.trueFalseButton,
                  selectedAnswer === 'true' && styles.selectedOption,
                  isAnswerChecked && 'true' === question.correctAnswer && styles.correctOption,
                  isAnswerChecked && selectedAnswer === 'true' && 
                  'true' !== question.correctAnswer && styles.incorrectOption,
                ]}
                onPress={() => !isAnswerChecked && setSelectedAnswer('true')}
                disabled={isAnswerChecked}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.trueFalseText,
                    selectedAnswer === 'true' && styles.selectedOptionText,
                    isAnswerChecked && 'true' === question.correctAnswer && styles.correctOptionText,
                    isAnswerChecked && selectedAnswer === 'true' && 
                    'true' !== question.correctAnswer && styles.incorrectOptionText,
                  ]}
                >
                  True
                </Text>
                
                {isAnswerChecked && 'true' === question.correctAnswer && (
                  <CheckCircle size={20} color={COLORS.white} />
                )}
                
                {isAnswerChecked && selectedAnswer === 'true' && 
                 'true' !== question.correctAnswer && (
                  <XCircle size={20} color={COLORS.white} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.trueFalseButton,
                  selectedAnswer === 'false' && styles.selectedOption,
                  isAnswerChecked && 'false' === question.correctAnswer && styles.correctOption,
                  isAnswerChecked && selectedAnswer === 'false' && 
                  'false' !== question.correctAnswer && styles.incorrectOption,
                ]}
                onPress={() => !isAnswerChecked && setSelectedAnswer('false')}
                disabled={isAnswerChecked}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.trueFalseText,
                    selectedAnswer === 'false' && styles.selectedOptionText,
                    isAnswerChecked && 'false' === question.correctAnswer && styles.correctOptionText,
                    isAnswerChecked && selectedAnswer === 'false' && 
                    'false' !== question.correctAnswer && styles.incorrectOptionText,
                  ]}
                >
                  False
                </Text>
                
                {isAnswerChecked && 'false' === question.correctAnswer && (
                  <CheckCircle size={20} color={COLORS.white} />
                )}
                
                {isAnswerChecked && selectedAnswer === 'false' && 
                 'false' !== question.correctAnswer && (
                  <XCircle size={20} color={COLORS.white} />
                )}
              </TouchableOpacity>
            </View>
          )}
          
          {question.type === 'matching' && question.options && (
            <View style={styles.matchingContainer}>
              <Text style={styles.matchingInstructions}>
                Match the words with their translations
              </Text>
              {/* This is a simplified version of matching - in a real app, you'd implement drag and drop */}
              <View style={styles.matchingColumns}>
                <View style={styles.matchingColumn}>
                  {question.options.slice(0, question.options.length / 2).map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.matchingItem,
                        selectedAnswer === `${index}` && styles.selectedMatchingItem
                      ]}
                      onPress={() => !isAnswerChecked && setSelectedAnswer(`${index}`)}
                      disabled={isAnswerChecked}
                    >
                      <Text style={styles.matchingText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.matchingColumn}>
                  {question.options.slice(question.options.length / 2).map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.matchingItem,
                        selectedAnswer === `${index + question.options.length / 2}` && styles.selectedMatchingItem
                      ]}
                      onPress={() => !isAnswerChecked && setSelectedAnswer(`${index + question.options.length / 2}`)}
                      disabled={isAnswerChecked}
                    >
                      <Text style={styles.matchingText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {isAnswerChecked && (
                <Text style={styles.matchingNote}>
                  Correct matches: {Array.isArray(question.correctAnswer) 
                    ? question.correctAnswer.join(', ') 
                    : question.correctAnswer}
                </Text>
              )}
            </View>
          )}
          
          {question.type === 'sentence-completion' && question.options && (
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
          
          {question.type === 'word-order' && question.options && (
            <View style={styles.wordOrderContainer}>
              <Text style={styles.wordOrderInstructions}>
                Arrange the words to form a correct sentence
              </Text>
              <View style={styles.wordOrderWords}>
                {question.options.map((word, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.wordOrderWord,
                      selectedAnswer === `${index}` && styles.selectedWordOrderWord
                    ]}
                    onPress={() => !isAnswerChecked && setSelectedAnswer(`${index}`)}
                    disabled={isAnswerChecked}
                  >
                    <Text style={styles.wordOrderText}>{word}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {isAnswerChecked && (
                <Text style={styles.wordOrderCorrect}>
                  Correct order: {Array.isArray(question.correctAnswer) 
                    ? question.correctAnswer.join(' ') 
                    : question.correctAnswer}
                </Text>
              )}
            </View>
          )}
          
          {question.type === 'context-selection' && question.options && (
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
              title="Check Answer"
              onPress={handleCheckAnswer}
              disabled={selectedAnswer === null}
              style={styles.actionButton}
            />
          ) : (
            <Button
              title={currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
              onPress={handleNextQuestion}
              style={styles.actionButton}
            />
          )}
        </View>
      </View>
    );
  };
  
  const renderQuizResults = () => {
    const correctAnswers = questions.filter(q => {
      if (Array.isArray(q.correctAnswer)) {
        return q.userAnswer && q.correctAnswer.includes(q.userAnswer as string);
      }
      return q.userAnswer?.toLowerCase() === q.correctAnswer.toLowerCase();
    }).length;
    
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    
    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Quiz Completed!</Text>
        
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
              <Text style={styles.statValue}>{questions.length - correctAnswers}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{questions.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </Card>
        
        <Text style={styles.reviewTitle}>Review Questions</Text>
        
        {questions.map((question, index) => {
          const isCorrect = Array.isArray(question.correctAnswer)
            ? question.userAnswer && question.correctAnswer.includes(question.userAnswer as string)
            : question.userAnswer?.toLowerCase() === question.correctAnswer.toLowerCase();
          
          return (
            <Card 
              key={question.id} 
              variant="outlined" 
              style={[
                styles.reviewCard,
                isCorrect ? styles.correctReviewCard : styles.incorrectReviewCard
              ]}
            >
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewQuestion}>
                  {index + 1}. {question.question}
                </Text>
                {isCorrect ? (
                  <CheckCircle size={20} color={COLORS.success} />
                ) : (
                  <XCircle size={20} color={COLORS.error} />
                )}
              </View>
              
              <View style={styles.reviewAnswers}>
                <Text style={styles.reviewAnswerLabel}>Your answer:</Text>
                <Text 
                  style={[
                    styles.reviewAnswer,
                    isCorrect ? styles.correctAnswer : styles.incorrectAnswer
                  ]}
                >
                  {question.userAnswer || 'No answer'}
                </Text>
                
                {!isCorrect && (
                  <>
                    <Text style={styles.reviewAnswerLabel}>Correct answer:</Text>
                    <Text style={[styles.reviewAnswer, styles.correctAnswer]}>
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
        
        <Button
          title="Finish"
          onPress={handleFinishQuiz}
          style={styles.finishButton}
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Quiz',
          headerLeft: currentStep === 0 ? () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.dark} />
            </TouchableOpacity>
          ) : undefined,
          headerShown: currentStep < 2,
        }}
      />
      
      {isGenerating ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Generating quiz questions...</Text>
        </View>
      ) : currentStep === 0 ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Select Word List</Text>
          
          {availableLists.length === 0 ? (
            <Card variant="outlined" style={styles.emptyListCard}>
              <BookText size={40} color={`${COLORS.primary}50`} />
              <Text style={styles.emptyListTitle}>No Lists Available</Text>
              <Text style={styles.emptyListText}>
                Create a word list with at least 3 words to start a quiz.
              </Text>
              <Button
                title="Create List"
                onPress={() => router.push('/lists/create')}
                style={styles.emptyListButton}
              />
            </Card>
          ) : (
            <>
              {availableLists.map(list => (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.listCard,
                    selectedListId === list.id && styles.selectedListCard
                  ]}
                  onPress={() => handleSelectList(list.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.listInfo}>
                    <Text style={styles.listTitle}>{list.title}</Text>
                    <Text style={styles.listMeta}>
                      {list.words.length} words • {getLanguageFlag(list.sourceLanguage)} → {getLanguageFlag(list.targetLanguage)}
                    </Text>
                  </View>
                  {selectedListId === list.id && (
                    <CheckCircle size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
              
              <Text style={styles.sectionTitle}>Quiz Options</Text>
              
              <Card variant="outlined" style={styles.optionsCard}>
                <View style={styles.optionRow}>
                  <Text style={styles.optionLabel}>Time Limit</Text>
                  <Switch
                    value={isTimeLimited}
                    onValueChange={setIsTimeLimited}
                    trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}80` }}
                    thumbColor={isTimeLimited ? COLORS.primary : COLORS.white}
                  />
                </View>
                
                {isTimeLimited && (
                  <View style={styles.optionRow}>
                    <Text style={styles.optionLabel}>Time per question</Text>
                    <View style={styles.timeOptions}>
                      {[30, 60, 90].map(seconds => (
                        <TouchableOpacity
                          key={seconds}
                          style={[
                            styles.timeOption,
                            timeLimit === seconds && styles.selectedTimeOption
                          ]}
                          onPress={() => setTimeLimit(seconds)}
                        >
                          <Text 
                            style={[
                              styles.timeOptionText,
                              timeLimit === seconds && styles.selectedTimeOptionText
                            ]}
                          >
                            {seconds}s
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                
                <View style={styles.optionRow}>
                  <Text style={styles.optionLabel}>Number of questions</Text>
                  <View style={styles.timeOptions}>
                    {[5, 7, 10].map(count => (
                      <TouchableOpacity
                        key={count}
                        style={[
                          styles.timeOption,
                          questionCount === count && styles.selectedTimeOption
                        ]}
                        onPress={() => setQuestionCount(count)}
                      >
                        <Text 
                          style={[
                            styles.timeOptionText,
                            questionCount === count && styles.selectedTimeOptionText
                          ]}
                        >
                          {count}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </Card>
              
              <Button
                title="Start Quiz"
                onPress={handleStartQuiz}
                disabled={!selectedListId}
                style={styles.startButton}
              />
              
              <TouchableOpacity
                style={styles.customQuizLink}
                onPress={() => setCurrentStep(1)}
              >
                <Text style={styles.customQuizText}>
                  Or create a custom quiz without a word list
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      ) : currentStep === 1 ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Custom Quiz</Text>
          <Text style={styles.sectionDescription}>
            Select languages for your custom quiz
          </Text>
          
          <View style={styles.languageSelectionContainer}>
            <LanguageSelector
              selectedLanguage={sourceLanguage}
              onSelectLanguage={handleSourceLanguageChange}
              label="Source Language"
              excludeLanguages={[targetLanguage]}
            />
            
            <LanguageSelector
              selectedLanguage={targetLanguage}
              onSelectLanguage={handleTargetLanguageChange}
              label="Target Language"
              excludeLanguages={[sourceLanguage]}
            />
          </View>
          
          <Text style={styles.sectionTitle}>Quiz Options</Text>
          
          <Card variant="outlined" style={styles.optionsCard}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Time Limit</Text>
              <Switch
                value={isTimeLimited}
                onValueChange={setIsTimeLimited}
                trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}80` }}
                thumbColor={isTimeLimited ? COLORS.primary : COLORS.white}
              />
            </View>
            
            {isTimeLimited && (
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Time per question</Text>
                <View style={styles.timeOptions}>
                  {[30, 60, 90].map(seconds => (
                    <TouchableOpacity
                      key={seconds}
                      style={[
                        styles.timeOption,
                        timeLimit === seconds && styles.selectedTimeOption
                      ]}
                      onPress={() => setTimeLimit(seconds)}
                    >
                      <Text 
                        style={[
                          styles.timeOptionText,
                          timeLimit === seconds && styles.selectedTimeOptionText
                        ]}
                      >
                        {seconds}s
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Number of questions</Text>
              <View style={styles.timeOptions}>
                {[5, 7, 10].map(count => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.timeOption,
                      questionCount === count && styles.selectedTimeOption
                    ]}
                    onPress={() => setQuestionCount(count)}
                  >
                    <Text 
                      style={[
                        styles.timeOptionText,
                        questionCount === count && styles.selectedTimeOptionText
                      ]}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
          
          <View style={styles.customQuizActions}>
            <Button
              title="Back"
              onPress={() => setCurrentStep(0)}
              variant="outline"
              style={styles.customQuizButton}
            />
            <Button
              title="Start Quiz"
              onPress={handleStartQuiz}
              style={styles.customQuizButton}
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.quizContent}
          showsVerticalScrollIndicator={false}
        >
          {quizCompleted ? renderQuizResults() : renderCurrentQuestion()}
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
  },
  quizContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.sm,
  },
  sectionDescription: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.md,
  },
  listCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  selectedListCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  listMeta: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  optionsCard: {
    marginBottom: THEME.spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  optionLabel: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  timeOptions: {
    flexDirection: 'row',
  },
  timeOption: {
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: COLORS.lightGray,
    marginLeft: THEME.spacing.xs,
  },
  selectedTimeOption: {
    backgroundColor: COLORS.primary,
  },
  timeOptionText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  selectedTimeOptionText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  startButton: {
    marginTop: THEME.spacing.md,
  },
  customQuizLink: {
    alignItems: 'center',
    marginTop: THEME.spacing.md,
    padding: THEME.spacing.sm,
  },
  customQuizText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  emptyListCard: {
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  emptyListTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  emptyListText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  emptyListButton: {
    marginTop: THEME.spacing.sm,
  },
  languageSelectionContainer: {
    marginBottom: THEME.spacing.lg,
  },
  customQuizActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.md,
  },
  customQuizButton: {
    flex: 1,
    marginHorizontal: THEME.spacing.xs,
  },
  questionContainer: {
    flex: 1,
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
  fillBlankContainer: {
    marginTop: THEME.spacing.sm,
  },
  fillBlankInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  correctFillBlank: {
    borderColor: COLORS.success,
    backgroundColor: `${COLORS.success}10`,
  },
  incorrectFillBlank: {
    borderColor: COLORS.error,
    backgroundColor: `${COLORS.error}10`,
  },
  correctAnswerText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.success,
    marginTop: THEME.spacing.xs,
    fontWeight: '500',
  },
  trueFalseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.sm,
  },
  trueFalseButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    flex: 1,
    marginHorizontal: THEME.spacing.xs,
  },
  trueFalseText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
    marginRight: THEME.spacing.sm,
  },
  matchingContainer: {
    marginTop: THEME.spacing.sm,
  },
  matchingInstructions: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.sm,
  },
  matchingColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchingColumn: {
    flex: 1,
    marginHorizontal: THEME.spacing.xs,
  },
  matchingItem: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
    alignItems: 'center',
  },
  selectedMatchingItem: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  matchingText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  matchingNote: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    fontStyle: 'italic',
    marginTop: THEME.spacing.sm,
  },
  wordOrderContainer: {
    marginTop: THEME.spacing.sm,
  },
  wordOrderInstructions: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.sm,
  },
  wordOrderWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  wordOrderWord: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.sm,
    margin: THEME.spacing.xs,
  },
  selectedWordOrderWord: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  wordOrderText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  wordOrderCorrect: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.success,
    marginTop: THEME.spacing.md,
    fontWeight: '500',
  },
  questionActions: {
    marginTop: THEME.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  resultsContainer: {
    flex: 1,
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
  reviewTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.md,
  },
  reviewCard: {
    marginBottom: THEME.spacing.md,
  },
  correctReviewCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  incorrectReviewCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.sm,
  },
  reviewQuestion: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
    marginRight: THEME.spacing.sm,
  },
  reviewAnswers: {
    marginTop: THEME.spacing.xs,
  },
  reviewAnswerLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  reviewAnswer: {
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
  finishButton: {
    marginTop: THEME.spacing.lg,
  },
});