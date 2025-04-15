import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import { ArrowLeft, Search, Clock, BookOpen, X } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import Badge from '@/components/ui/Badge';

type StoryFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export default function AllStoriesScreen() {
  const router = useRouter();
  const { stories } = useAppStore();
  
  const [activeFilter, setActiveFilter] = useState<StoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredStories = stories.filter(story => {
    const matchesFilter = activeFilter === 'all' || story.difficulty === activeFilter;
    const matchesSearch = searchQuery === '' || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  const navigateToStory = (storyId: string) => {
    router.push(`/stories/story/${storyId}`);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const renderStoryItem = ({ item: story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => navigateToStory(story.id)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: story.imageUrl }}
        style={styles.storyImage}
      />
      <View style={styles.storyContent}>
        <View style={styles.storyHeader}>
          <Badge 
            text={story.difficulty} 
            variant={
              story.difficulty === 'beginner' ? 'success' : 
              story.difficulty === 'intermediate' ? 'warning' : 
              'error'
            }
            size="sm"
          />
          <View style={styles.storyMeta}>
            <Clock size={14} color={COLORS.darkGray} />
            <Text style={styles.storyMetaText}>{story.duration} min</Text>
          </View>
        </View>
        <Text style={styles.storyTitle}>{story.title}</Text>
        <Text style={styles.storyDescription} numberOfLines={2}>
          {story.description}
        </Text>
      </View>
      {story.isPremium && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'All Stories',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.dark} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.darkGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={COLORS.darkGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && styles.activeFilterButton
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text 
            style={[
              styles.filterText,
              activeFilter === 'all' && styles.activeFilterText
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'beginner' && styles.activeFilterButton
          ]}
          onPress={() => setActiveFilter('beginner')}
        >
          <Text 
            style={[
              styles.filterText,
              activeFilter === 'beginner' && styles.activeFilterText
            ]}
          >
            Beginner
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'intermediate' && styles.activeFilterButton
          ]}
          onPress={() => setActiveFilter('intermediate')}
        >
          <Text 
            style={[
              styles.filterText,
              activeFilter === 'intermediate' && styles.activeFilterText
            ]}
          >
            Intermediate
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'advanced' && styles.activeFilterButton
          ]}
          onPress={() => setActiveFilter('advanced')}
        >
          <Text 
            style={[
              styles.filterText,
              activeFilter === 'advanced' && styles.activeFilterText
            ]}
          >
            Advanced
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found
        </Text>
      </View>
      
      <FlatList
        data={filteredStories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.storiesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BookOpen size={60} color={`${COLORS.primary}50`} />
            <Text style={styles.emptyTitle}>No Stories Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filters or search query
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  searchContainer: {
    padding: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  searchIcon: {
    marginRight: THEME.spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterButton: {
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: COLORS.white,
    marginRight: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  activeFilterText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
  },
  resultsCount: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  storiesList: {
    padding: THEME.spacing.lg,
    paddingTop: 0,
  },
  storyCard: {
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    overflow: 'hidden',
    ...THEME.shadows.small,
  },
  storyImage: {
    width: '100%',
    height: 120,
  },
  storyContent: {
    padding: THEME.spacing.md,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyMetaText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  storyTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.xs,
  },
  storyDescription: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.secondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.md,
  },
  premiumText: {
    color: COLORS.white,
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  emptyTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  emptyText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});