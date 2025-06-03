import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  TextInput as RNTextInput,
  Modal,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Plus, 
  ArrowLeft, 
  MoreVertical, 
  Search,
  BookText,
  Check,
  X,
  Volume2,
  Edit,
  Trash,
  Save,
  MoreHorizontal
} from 'lucide-react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getLanguageFlag, getLanguageName } from '@/constants/languages';
import TextInput from '@/components/ui/TextInput';
import { translateWord } from '@/services/gemini-service';
import { Word } from '@/types';

export default function ListDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    wordLists, 
    updateWordList, 
    deleteWordList,
    addWordToList,
    markWordAsLearned,
    deleteWord,
    updateWord
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddWord, setShowAddWord] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editWordText, setEditWordText] = useState('');
  const [editTranslationText, setEditTranslationText] = useState('');
  const [showWordOptions, setShowWordOptions] = useState<string | null>(null);
  
  const titleInputRef = useRef<RNTextInput>(null);
  
  const list = wordLists.find(list => list.id === id);
  
  useEffect(() => {
    if (!list) {
      // List not found, navigate back
      router.replace('/lists');
    } else {
      setEditTitle(list.title);
      setEditDescription(list.description || '');
    }
  }, [list, router]);
  
  if (!list) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  const filteredWords = list.words.filter(word => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      word.original.toLowerCase().includes(query) ||
      word.translation.toLowerCase().includes(query) ||
      (word.context && word.context.toLowerCase().includes(query))
    );
  });
  
  const handleDeleteList = () => {
    Alert.alert(
      'Delete List',
      'Are you sure you want to delete this list? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteWordList(list.id);
            router.replace('/lists');
          },
        },
      ]
    );
  };
  
  const handleAddWord = async () => {
    if (!newWord.trim()) return;

    setIsTranslating(true);

    try {
      console.log(`Translating "${newWord.trim()}" from ${list.sourceLanguage} to ${list.targetLanguage}`);

      const translationResult = await translateWord(
        newWord.trim(),
        list.sourceLanguage,
        list.targetLanguage
      );

      console.log('Translation result:', translationResult);

      const wordToAdd: Omit<Word, 'id' | 'createdAt' | 'learned'> = {
        original: newWord.trim(),
        translation: translationResult.translation,
        pronunciation: translationResult.pronunciation,
        examples: translationResult.examples || [],
        context: translationResult.context,
      };

      addWordToList(list.id, wordToAdd);
      setNewWord('');
      setShowAddWord(false);

      // Show success message
      Alert.alert(
        'Word Added',
        `"${newWord.trim()}" has been translated and added to your list.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert(
        'Translation Error',
        `Failed to translate "${newWord.trim()}". The word was added with a placeholder translation. You can edit it manually.`,
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

              addWordToList(list.id, wordToAdd);
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
  
  const handleToggleWordLearned = (wordId: string, learned: boolean) => {
    markWordAsLearned(list.id, wordId, !learned);
  };
  
  const handleDeleteWord = (wordId: string) => {
    Alert.alert(
      'Delete Word',
      'Are you sure you want to delete this word?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteWord(list.id, wordId);
            setShowWordOptions(null);
          },
        },
      ]
    );
  };
  
  const handleEditList = () => {
    setEditMode(true);
    setShowOptionsMenu(false);
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  };
  
  const handleSaveListEdit = () => {
    if (!editTitle.trim()) {
      Alert.alert('Error', 'List title cannot be empty');
      return;
    }
    
    updateWordList(list.id, {
      title: editTitle,
      description: editDescription,
    });
    
    setEditMode(false);
  };
  
  const handleCancelListEdit = () => {
    setEditTitle(list.title);
    setEditDescription(list.description || '');
    setEditMode(false);
  };
  
  const handleEditWord = (word: Word) => {
    setEditingWordId(word.id);
    setEditWordText(word.original);
    setEditTranslationText(word.translation);
    setShowWordOptions(null);
  };
  
  const handleSaveWordEdit = async () => {
    if (!editingWordId || !editWordText.trim() || !editTranslationText.trim()) {
      return;
    }
    
    // If the original word changed, we might want to re-translate
    const word = list.words.find(w => w.id === editingWordId);
    if (!word) return;
    
    const needsTranslation = editWordText !== word.original;
    
    if (needsTranslation) {
      setIsTranslating(true);
      try {
        const translationResult = await translateWord(
          editWordText.trim(),
          list.sourceLanguage,
          list.targetLanguage
        );
        
        updateWord(list.id, editingWordId, {
          original: editWordText.trim(),
          translation: translationResult.translation,
          pronunciation: translationResult.pronunciation,
          examples: translationResult.examples,
          context: translationResult.context,
        });
      } catch (error) {
        // If translation fails, just update with the user-provided values
        updateWord(list.id, editingWordId, {
          original: editWordText.trim(),
          translation: editTranslationText.trim(),
        });
      } finally {
        setIsTranslating(false);
      }
    } else {
      // Just update the translation without re-translating
      updateWord(list.id, editingWordId, {
        original: editWordText.trim(),
        translation: editTranslationText.trim(),
      });
    }
    
    setEditingWordId(null);
  };
  
  const handleCancelWordEdit = () => {
    setEditingWordId(null);
  };
  
  const renderWordItem = ({ item: word }) => (
    <Card 
      variant="outlined" 
      style={[
        styles.wordCard,
        word.learned && styles.learnedWordCard
      ]}
    >
      {editingWordId === word.id ? (
        <View style={styles.editWordContainer}>
          <TextInput
            label="Original Word"
            value={editWordText}
            onChangeText={setEditWordText}
            containerStyle={styles.editWordInput}
          />
          <TextInput
            label="Translation"
            value={editTranslationText}
            onChangeText={setEditTranslationText}
            containerStyle={styles.editWordInput}
          />
          <View style={styles.editWordActions}>
            <Button
              title="Cancel"
              onPress={handleCancelWordEdit}
              variant="outline"
              style={styles.editWordButton}
            />
            <Button
              title="Save"
              onPress={handleSaveWordEdit}
              loading={isTranslating}
              style={styles.editWordButton}
            />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.wordHeader}>
            <View style={styles.wordMain}>
              <Text style={styles.originalWord}>{word.original}</Text>
              <Text style={styles.translationWord}>
                {typeof word.translation === 'string' 
                  ? word.translation 
                  : word.translation && typeof word.translation === 'object'
                    ? JSON.stringify(word.translation)
                    : ''}
              </Text>
            </View>
            
            <View style={styles.wordActions}>
              <TouchableOpacity 
                style={styles.wordAction}
                onPress={() => handleToggleWordLearned(word.id, word.learned)}
              >
                {word.learned ? (
                  <Check size={20} color={COLORS.success} />
                ) : (
                  <Check size={20} color={COLORS.lightGray} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.wordAction}>
                <Volume2 size={20} color={COLORS.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.wordAction}
                onPress={() => setShowWordOptions(showWordOptions === word.id ? null : word.id)}
              >
                <MoreHorizontal size={20} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>
          </View>
          
          {showWordOptions === word.id && (
            <View style={styles.wordOptionsMenu}>
              <TouchableOpacity 
                style={styles.wordOptionItem}
                onPress={() => handleEditWord(word)}
              >
                <Edit size={16} color={COLORS.dark} />
                <Text style={styles.wordOptionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.wordOptionItem}
                onPress={() => handleDeleteWord(word.id)}
              >
                <Trash size={16} color={COLORS.error} />
                <Text style={[styles.wordOptionText, { color: COLORS.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {word.pronunciation && (
            <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
          )}
          
          {word.examples && word.examples.length > 0 && (
            <View style={styles.examplesContainer}>
              {word.examples.map((example, index) => (
                <Text key={index} style={styles.example}>
                  • {typeof example === 'string' 
                      ? example 
                      : example && typeof example === 'object'
                        ? JSON.stringify(example)
                        : ''}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </Card>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: editMode ? 'Edit List' : list.title,
          headerLeft: () => (
            <TouchableOpacity onPress={() => {
              if (editMode) {
                handleCancelListEdit();
              } else {
                router.back();
              }
            }}>
              <ArrowLeft size={24} color={COLORS.dark} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            editMode ? (
              <TouchableOpacity onPress={handleSaveListEdit}>
                <Save size={24} color={COLORS.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setShowOptionsMenu(!showOptionsMenu)}>
                <MoreVertical size={24} color={COLORS.dark} />
              </TouchableOpacity>
            )
          ),
        }}
      />
      
      {showOptionsMenu && (
        <View style={styles.optionsMenu}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleEditList}
          >
            <Edit size={20} color={COLORS.dark} />
            <Text style={styles.optionText}>Edit List</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleDeleteList}
          >
            <Trash size={20} color={COLORS.error} />
            <Text style={[styles.optionText, { color: COLORS.error }]}>Delete List</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {editMode ? (
        <View style={styles.editContainer}>
          <TextInput
            ref={titleInputRef}
            label="List Title"
            value={editTitle}
            onChangeText={setEditTitle}
            containerStyle={styles.editInput}
          />
          <TextInput
            label="Description (optional)"
            value={editDescription}
            onChangeText={setEditDescription}
            multiline
            containerStyle={styles.editInput}
          />
        </View>
      ) : (
        <View style={styles.header}>
          <View style={styles.listInfo}>
            <View style={styles.languageContainer}>
              <Text style={styles.languageText}>
                {getLanguageFlag(list.sourceLanguage)} {getLanguageName(list.sourceLanguage)}
              </Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.languageText}>
                {getLanguageFlag(list.targetLanguage)} {getLanguageName(list.targetLanguage)}
              </Text>
            </View>
            
            {list.description && (
              <Text style={styles.description}>{list.description}</Text>
            )}
            
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {list.words.filter(w => w.learned).length}/{list.totalWords} words learned
              </Text>
              <ProgressBar progress={list.progress} />
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.darkGray} style={styles.searchIcon} />
          <TextInput
            placeholder="Search words..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
        </View>
      </View>
      
      {showAddWord ? (
        <View style={styles.addWordContainer}>
          <TextInput
            placeholder={`Enter word in ${getLanguageName(list.sourceLanguage)}...`}
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
              <X size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
            
            <Button
              title="Add Word"
              onPress={handleAddWord}
              loading={isTranslating}
              disabled={!newWord.trim() || isTranslating}
              style={styles.addWordButton}
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addWordButton}
          onPress={() => setShowAddWord(true)}
          activeOpacity={0.7}
        >
          <Plus size={20} color={COLORS.white} />
          <Text style={styles.addWordButtonText}>Add Word</Text>
        </TouchableOpacity>
      )}
      
      {list.words.length === 0 ? (
        <EmptyState
          title="No Words Yet"
          description="Add your first word to start building your vocabulary list."
          icon={<BookText size={40} color={COLORS.primary} />}
          actionLabel="Add Word"
          onAction={() => setShowAddWord(true)}
          style={styles.emptyState}
        />
      ) : (
        <FlatList
          data={filteredWords}
          renderItem={renderWordItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.wordsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No Results Found"
              description="Try adjusting your search to find what you're looking for."
              icon={<Search size={40} color={COLORS.primary} />}
              style={styles.emptyState}
            />
          }
          onScroll={() => {
            Keyboard.dismiss();
            setShowOptionsMenu(false);
            setShowWordOptions(null);
          }}
        />
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
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  listInfo: {
    marginBottom: THEME.spacing.sm,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  languageText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  arrow: {
    marginHorizontal: THEME.spacing.sm,
    color: COLORS.darkGray,
  },
  description: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.sm,
  },
  progressContainer: {
    marginTop: THEME.spacing.xs,
  },
  progressText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  searchContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: THEME.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  addWordContainer: {
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  addWordInput: {
    marginBottom: THEME.spacing.sm,
  },
  addWordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addWordCancel: {
    marginRight: THEME.spacing.md,
  },
  addWordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginHorizontal: THEME.spacing.lg,
    marginVertical: THEME.spacing.md,
  },
  addWordButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: THEME.spacing.xs,
  },
  wordsList: {
    padding: THEME.spacing.lg,
  },
  wordCard: {
    marginBottom: THEME.spacing.md,
  },
  learnedWordCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wordMain: {
    flex: 1,
  },
  originalWord: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2,
  },
  translationWord: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  pronunciation: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: THEME.spacing.sm,
  },
  wordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordAction: {
    marginLeft: THEME.spacing.sm,
    padding: 4,
  },
  examplesContainer: {
    marginTop: THEME.spacing.sm,
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  example: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
  },
  optionsMenu: {
    position: 'absolute',
    top: 60,
    right: THEME.spacing.lg,
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.sm,
    zIndex: 10,
    ...THEME.shadows.medium,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
  },
  optionText: {
    marginLeft: THEME.spacing.sm,
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  editContainer: {
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  editInput: {
    marginBottom: THEME.spacing.md,
  },
  wordOptionsMenu: {
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.md,
    marginTop: THEME.spacing.sm,
    padding: THEME.spacing.xs,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  wordOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
  },
  wordOptionText: {
    marginLeft: THEME.spacing.sm,
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.dark,
  },
  editWordContainer: {
    padding: THEME.spacing.sm,
  },
  editWordInput: {
    marginBottom: THEME.spacing.sm,
  },
  editWordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: THEME.spacing.sm,
  },
  editWordButton: {
    minWidth: 100,
  },
});