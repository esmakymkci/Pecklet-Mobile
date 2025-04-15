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
  BookOpen, 
  Share2,
  Heart,
  HeartOff,
  Bookmark,
  BookmarkCheck,
  VolumeX,
  Volume2,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Button from '@/components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';

export default function StoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stories } = useAppStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [story, setStory] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
  
  useEffect(() => {
    const storyData = stories.find(s => s.id === id);
    if (storyData) {
      setStory(storyData);
      
      // Generate some highlighted words from the content
      if (storyData.content) {
        const words = storyData.content
          .split(' ')
          .filter(word => word.length > 5)
          .slice(0, 5);
        setHighlightedWords(words);
      }
      
      setIsLoading(false);
    } else {
      Alert.alert('Error', 'Story not found');
      router.back();
    }
  }, [id, stories, router]);
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };
  
  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleShare = async () => {
    try {
      const message = `Check out "${story?.title}" on WordPecker! A great story for language learning.`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'Share Story',
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
  
  const handleStartQuiz = () => {
    // Navigate to quiz based on this story
    router.push(`/quiz/start?storyId=${id}`);
  };
  
  const handleWordPress = (word: string) => {
    // Show word definition or translation
    Alert.alert(
      'Word Definition',
      `"${word}" - This would show the definition or translation of the selected word.`,
      [{ text: 'OK' }]
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  // Format the story content with highlighted words
  const formatContent = () => {
    if (!story.content) return null;
    
    const paragraphs = story.content.split('\n\n');
    return paragraphs.map((paragraph, index) => {
      const words = paragraph.split(' ');
      
      return (
        <Text key={index} style={styles.paragraph}>
          {words.map((word, wordIndex) => {
            const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
            const isHighlighted = highlightedWords.includes(cleanWord);
            
            return (
              <React.Fragment key={`${index}-${wordIndex}`}>
                {isHighlighted ? (
                  <TouchableOpacity onPress={() => handleWordPress(cleanWord)}>
                    <Text style={styles.highlightedWord}>{word} </Text>
                  </TouchableOpacity>
                ) : (
                  <Text>{word} </Text>
                )}
              </React.Fragment>
            );
          })}
        </Text>
      );
    });
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={toggleSound}
                style={styles.headerAction}
              >
                {isSoundOn ? (
                  <Volume2 size={24} color={COLORS.white} />
                ) : (
                  <VolumeX size={24} color={COLORS.white} />
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleShare}
                style={styles.headerAction}
              >
                <Share2 size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.storyImageContainer}>
          <Image 
            source={{ uri: story.imageUrl }}
            style={styles.storyImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.storyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.storyOverlay}>
            <Badge 
              text={story.difficulty} 
              variant={
                story.difficulty === 'beginner' ? 'success' : 
                story.difficulty === 'intermediate' ? 'warning' : 
                'error'
              }
              size="md"
            />
            <Text style={styles.storyTitle}>{story.title}</Text>
            <View style={styles.storyMeta}>
              <View style={styles.storyMetaItem}>
                <Clock size={16} color={COLORS.white} />
                <Text style={styles.storyMetaText}>
                  {story.duration} min read
                </Text>
              </View>
              <View style={styles.storyMetaItem}>
                <BookOpen size={16} color={COLORS.white} />
                <Text style={styles.storyMetaText}>
                  {story.content.split(' ').length} words
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.storyActions}>
          <TouchableOpacity 
            style={styles.storyAction}
            onPress={toggleFavorite}
          >
            {isFavorite ? (
              <Heart size={24} color={COLORS.error} fill={COLORS.error} />
            ) : (
              <Heart size={24} color={COLORS.darkGray} />
            )}
            <Text style={styles.storyActionText}>
              {isFavorite ? 'Favorited' : 'Favorite'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.storyAction}
            onPress={toggleBookmark}
          >
            {isBookmarked ? (
              <BookmarkCheck size={24} color={COLORS.primary} fill={COLORS.primary} />
            ) : (
              <Bookmark size={24} color={COLORS.darkGray} />
            )}
            <Text style={styles.storyActionText}>
              {isBookmarked ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.storyAction}
            onPress={handleStartQuiz}
          >
            <BookOpen size={24} color={COLORS.darkGray} />
            <Text style={styles.storyActionText}>Quiz</Text>
          </TouchableOpacity>
        </View>
        
        <Card variant="outlined" style={styles.storyDescriptionCard}>
          <Text style={styles.storyDescriptionTitle}>About this Story</Text>
          <Text style={styles.storyDescription}>
            {story.description}
          </Text>
          
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={toggleExpand}
          >
            <Text style={styles.expandButtonText}>
              {isExpanded ? 'Show Less' : 'Show More'}
            </Text>
            {isExpanded ? (
              <ChevronUp size={16} color={COLORS.primary} />
            ) : (
              <ChevronDown size={16} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </Card>
        
        <Card variant="elevated" style={styles.storyContentCard}>
          <View style={styles.storyContentHeader}>
            <Text style={styles.storyContentTitle}>Story</Text>
            <Badge 
              text={`${highlightedWords.length} highlighted words`} 
              variant="primary"
              size="sm"
            />
          </View>
          
          <View style={styles.storyContent}>
            {formatContent()}
          </View>
        </Card>
        
        <Card variant="outlined" style={styles.vocabularyCard}>
          <Text style={styles.vocabularyTitle}>Vocabulary</Text>
          
          {highlightedWords.map((word, index) => (
            <View key={index} style={styles.vocabularyItem}>
              <Text style={styles.vocabularyWord}>{word}</Text>
              <Text style={styles.vocabularyDefinition}>
                {/* Mock definition */}
                {index % 2 === 0 
                  ? 'Definition would appear here with example usage.' 
                  : 'Another sample definition with translation and context.'}
              </Text>
            </View>
          ))}
          
          <Button
            title="Practice Vocabulary"
            onPress={handleStartQuiz}
            style={styles.vocabularyButton}
          />
        </Card>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: THEME.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: THEME.spacing.xxl,
  },
  storyImageContainer: {
    height: 300,
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  storyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: THEME.spacing.lg,
  },
  storyTitle: {
    fontSize: THEME.typography.fontSizes.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginVertical: THEME.spacing.sm,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  storyMetaText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.white,
    marginLeft: 4,
  },
  storyActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: THEME.spacing.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  storyAction: {
    alignItems: 'center',
  },
  storyActionText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  storyDescriptionCard: {
    margin: THEME.spacing.lg,
  },
  storyDescriptionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.sm,
  },
  storyDescription: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: THEME.spacing.md,
  },
  expandButtonText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  storyContentCard: {
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
  },
  storyContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  storyContentTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  storyContent: {
    paddingBottom: THEME.spacing.md,
  },
  paragraph: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
    lineHeight: 24,
    marginBottom: THEME.spacing.md,
  },
  highlightedWord: {
    backgroundColor: `${COLORS.primary}30`,
    borderRadius: 4,
    overflow: 'hidden',
    color: COLORS.primary,
    fontWeight: '500',
  },
  vocabularyCard: {
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
  },
  vocabularyTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.md,
  },
  vocabularyItem: {
    marginBottom: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  vocabularyWord: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  vocabularyDefinition: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  vocabularyButton: {
    marginTop: THEME.spacing.sm,
  },
});