import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { BookOpen, Trophy, Clock, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

type StoryFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
type CompetitionTab = 'stories' | 'competitions';

export default function StoriesScreen() {
  const router = useRouter();
  const { stories, competitions } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<StoryFilter>('all');
  const [activeTab, setActiveTab] = useState<CompetitionTab>('stories');
  
  const filteredStories = stories.filter(story => 
    activeFilter === 'all' || story.difficulty === activeFilter
  );
  
  const navigateToStory = (storyId: string) => {
    // Navigate to story detail
    router.push(`/stories/story/${storyId}`);
  };
  
  const navigateToCompetition = (competitionId: string) => {
    // Navigate to competition detail
    router.push(`/stories/competition/${competitionId}`);
  };
  
  const handleSeeAll = () => {
    // Navigate to all stories view
    router.push('/stories/all');
  };
  
  const handleUpgradeToPremium = () => {
    // Navigate to premium upgrade screen
    router.push('/profile/premium');
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
  
  const renderCompetitionItem = ({ item: competition }) => (
    <TouchableOpacity
      style={styles.competitionCard}
      onPress={() => navigateToCompetition(competition.id)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent']}
        style={styles.competitionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <Image 
        source={{ uri: competition.imageUrl }}
        style={styles.competitionImage}
      />
      <View style={styles.competitionContent}>
        <Badge 
          text={competition.category} 
          variant="primary"
          size="sm"
        />
        <Text style={styles.competitionTitle}>{competition.title}</Text>
        <View style={styles.competitionMeta}>
          <View style={styles.competitionMetaItem}>
            <Users size={14} color={COLORS.white} />
            <Text style={styles.competitionMetaText}>
              {competition.participants} participants
            </Text>
          </View>
          <View style={styles.competitionMetaItem}>
            <Clock size={14} color={COLORS.white} />
            <Text style={styles.competitionMetaText}>
              {competition.duration} min
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'stories' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('stories')}
        >
          <BookOpen 
            size={18} 
            color={activeTab === 'stories' ? COLORS.primary : COLORS.darkGray} 
          />
          <Text 
            style={[
              styles.tabText,
              activeTab === 'stories' && styles.activeTabText
            ]}
          >
            Stories
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'competitions' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('competitions')}
        >
          <Trophy 
            size={18} 
            color={activeTab === 'competitions' ? COLORS.primary : COLORS.darkGray} 
          />
          <Text 
            style={[
              styles.tabText,
              activeTab === 'competitions' && styles.activeTabText
            ]}
          >
            Competitions
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'stories' ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Stories</Text>
            <Text style={styles.subtitle}>Learn through immersive reading</Text>
          </View>
          
          <Card variant="elevated" style={styles.premiumCard}>
            <View style={styles.premiumCardContent}>
              <View>
                <Text style={styles.premiumCardTitle}>Premium Stories</Text>
                <Text style={styles.premiumCardSubtitle}>
                  Unlock 100+ stories across all languages
                </Text>
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={handleUpgradeToPremium}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.bookIconContainer}>
                <BookOpen size={40} color={COLORS.white} />
              </View>
            </View>
          </Card>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
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
          </ScrollView>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Stories</Text>
            <TouchableOpacity onPress={handleSeeAll}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredStories}
            renderItem={renderStoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.storiesList}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Competitions</Text>
            <Text style={styles.subtitle}>Challenge yourself with themed contests</Text>
          </View>
          
          <FlatList
            data={competitions}
            renderItem={renderCompetitionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.competitionsList}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
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
    marginBottom: THEME.spacing.md,
  },
  premiumCard: {
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    backgroundColor: COLORS.secondary,
  },
  premiumCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumCardTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  premiumCardSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: THEME.spacing.sm,
  },
  upgradeButton: {
    backgroundColor: COLORS.white,
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    color: COLORS.secondary,
    fontWeight: '600',
    fontSize: THEME.typography.fontSizes.sm,
  },
  bookIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
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
  storiesList: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
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
  competitionsList: {
    padding: THEME.spacing.lg,
  },
  competitionCard: {
    height: 180,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    overflow: 'hidden',
    ...THEME.shadows.medium,
  },
  competitionImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  competitionGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    zIndex: 1,
  },
  competitionContent: {
    padding: THEME.spacing.md,
    position: 'relative',
    zIndex: 2,
  },
  competitionTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
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
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.white,
    marginLeft: 4,
  },
});