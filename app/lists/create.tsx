import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import TextInput from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Check, X, Plus, Trash2, Volume2 } from 'lucide-react-native';
import { translateWord } from '@/services/gemini-service';
import { Word } from '@/types';
import { getLanguageName } from '@/constants/languages';

export default function CreateListScreen() {
  const router = useRouter();
  const { addWordList, userSettings } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState(userSettings.defaultSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(userSettings.defaultTargetLanguage);

  const [titleError, setTitleError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Word management states
  const [words, setWords] = useState<Omit<Word, 'id' | 'createdAt' | 'learned'>[]>([]);
  const [newWord, setNewWord] = useState('');
  const [showAddWord, setShowAddWord] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const validateForm = () => {
    let isValid = true;

    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (sourceLanguage === targetLanguage) {
      Alert.alert('Error', 'Source and target languages must be different');
      isValid = false;
    }

    return isValid;
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;

    setIsTranslating(true);

    try {
      console.log(`Translating "${newWord.trim()}" from ${sourceLanguage} to ${targetLanguage}`);

      const translationResult = await translateWord(
        newWord.trim(),
        sourceLanguage,
        targetLanguage
      );

      console.log('Translation result:', translationResult);

      const wordToAdd: Omit<Word, 'id' | 'createdAt' | 'learned'> = {
        original: newWord.trim(),
        translation: translationResult.translation,
        pronunciation: translationResult.pronunciation,
        examples: translationResult.examples || [],
        context: translationResult.context,
      };

      setWords(prev => [...prev, wordToAdd]);
      setNewWord('');
      setShowAddWord(false);

      Alert.alert(
        'Word Added',
        `"${newWord.trim()}" has been translated and added to your list.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert(
        'Translation Error',
        `Failed to translate "${newWord.trim()}". The word was added with a placeholder translation. You can edit it manually later.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Add Anyway',
            onPress: () => {
              const wordToAdd: Omit<Word, 'id' | 'createdAt' | 'learned'> = {
                original: newWord.trim(),
                translation: `[Translation needed]`,
                pronunciation: '',
                examples: [],
                context: 'Please edit to add translation',
              };

              setWords(prev => [...prev, wordToAdd]);
              setNewWord('');
              setShowAddWord(false);
            },
          },
        ]
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRemoveWord = (index: number) => {
    setWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateList = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Create the list with words
    addWordList({
      title: title.trim(),
      description: description.trim(),
      context: context.trim(),
      sourceLanguage,
      targetLanguage,
      words: words.map((word, index) => ({
        ...word,
        id: `temp_${Date.now()}_${index}`,
        learned: false,
        createdAt: new Date(),
      })),
    });

    // Navigate back to lists screen
    router.replace('/lists');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Create Word List',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.dark} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleCreateList}
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.5 : 1 }}
            >
              <Check size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <TextInput
              label="List Title"
              placeholder="Enter a title for your word list"
              value={title}
              onChangeText={setTitle}
              error={titleError}
              autoCapitalize="words"
            />
            
            <TextInput
              label="Description (Optional)"
              placeholder="Add a description for your list"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
            
            <TextInput
              label="Context/Source (Optional)"
              placeholder="e.g., Book title, movie, course"
              value={context}
              onChangeText={setContext}
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Languages</Text>
            
            <LanguageSelector
              selectedLanguage={sourceLanguage}
              onSelectLanguage={setSourceLanguage}
              label="Source Language"
              excludeLanguages={[targetLanguage]}
            />
            
            <LanguageSelector
              selectedLanguage={targetLanguage}
              onSelectLanguage={setTargetLanguage}
              label="Target Language"
              excludeLanguages={[sourceLanguage]}
            />
          </View>
          
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Words ({words.length})</Text>
              <TouchableOpacity
                style={styles.addWordButton}
                onPress={() => setShowAddWord(true)}
                activeOpacity={0.7}
              >
                <Plus size={16} color={COLORS.white} />
                <Text style={styles.addWordButtonText}>Add Word</Text>
              </TouchableOpacity>
            </View>

            {showAddWord && (
              <View style={styles.addWordContainer}>
                <TextInput
                  placeholder={`Enter word in ${getLanguageName(sourceLanguage)}...`}
                  value={newWord}
                  onChangeText={setNewWord}
                  containerStyle={styles.addWordInput}
                />

                <View style={styles.addWordActions}>
                  <TouchableOpacity
                    style={styles.addWordCancel}
                    onPress={() => {
                      setNewWord('');
                      setShowAddWord(false);
                    }}
                    disabled={isTranslating}
                  >
                    <X size={20} color={COLORS.darkGray} />
                  </TouchableOpacity>

                  <Button
                    title="Add"
                    onPress={handleAddWord}
                    loading={isTranslating}
                    disabled={!newWord.trim() || isTranslating}
                    style={styles.addWordSubmitButton}
                  />
                </View>
              </View>
            )}

            {words.length > 0 && (
              <View style={styles.wordsContainer}>
                {words.map((word, index) => (
                  <View key={index} style={styles.wordCard}>
                    <View style={styles.wordContent}>
                      <View style={styles.wordMain}>
                        <Text style={styles.originalWord}>{word.original}</Text>
                        <Text style={styles.translationWord}>{word.translation}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.removeWordButton}
                        onPress={() => handleRemoveWord(index)}
                      >
                        <Trash2 size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>

                    {word.pronunciation && (
                      <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
                    )}

                    {word.examples && word.examples.length > 0 && (
                      <View style={styles.examplesContainer}>
                        {word.examples.slice(0, 2).map((example, exampleIndex) => (
                          <Text key={exampleIndex} style={styles.example}>
                            • {example}
                          </Text>
                        ))}
                        {word.examples.length > 2 && (
                          <Text style={styles.moreExamples}>
                            +{word.examples.length - 2} more examples
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {words.length === 0 && (
              <View style={styles.emptyWordsContainer}>
                <Text style={styles.emptyWordsText}>
                  No words added yet. Add your first word to get started!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            title="Create List"
            onPress={handleCreateList}
            loading={isSubmitting}
            style={styles.footerButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
  },
  formSection: {
    marginBottom: THEME.spacing.xl,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.sm,
  },
  sectionDescription: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  templateTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  templateCount: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: THEME.spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addWordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addWordButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  addWordContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addWordInput: {
    marginBottom: 12,
  },
  addWordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addWordCancel: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  addWordSubmitButton: {
    flex: 1,
  },
  wordsContainer: {
    gap: 12,
  },
  wordCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  wordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  wordMain: {
    flex: 1,
  },
  originalWord: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  translationWord: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  removeWordButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  pronunciation: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  examplesContainer: {
    gap: 4,
  },
  example: {
    fontSize: 12,
    color: COLORS.darkGray,
    lineHeight: 16,
  },
  moreExamples: {
    fontSize: 11,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyWordsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyWordsText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});