import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  TextInput as RNTextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Plus, 
  Search, 
  BookText, 
  GraduationCap, 
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getLanguageFlag } from '@/constants/languages';

export default function ListsScreen() {
  const router = useRouter();
  const { wordLists } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const navigateToCreateList = () => {
    router.push('/lists/create');
  };
  
  const navigateToListDetail = (listId: string) => {
    router.push(`/lists/${listId}`);
  };
  
  const navigateToQuiz = (listId: string) => {
    router.push({
      pathname: '/quiz/start',
      params: { listId }
    });
  };
  
  const filteredLists = wordLists.filter(list => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      list.title.toLowerCase().includes(query) ||
      (list.description && list.description.toLowerCase().includes(query)) ||
      list.words.some(word => 
        word.original.toLowerCase().includes(query) || 
        word.translation.toLowerCase().includes(query)
      )
    );
  });
  
  const renderListItem = ({ item: list }) => (
    <Card 
      variant="elevated" 
      style={styles.listCard}
    >
      <TouchableOpacity
        style={styles.listCardContent}
        onPress={() => navigateToListDetail(list.id)}
        activeOpacity={0.7}
      >
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{list.title}</Text>
          <View style={styles.languageFlags}>
            <Text style={styles.languageFlag}>
              {getLanguageFlag(list.sourceLanguage)}
            </Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.languageFlag}>
              {getLanguageFlag(list.targetLanguage)}
            </Text>
          </View>
        </View>
        
        {list.description && (
          <Text style={styles.listDescription} numberOfLines={2}>
            {list.description}
          </Text>
        )}
        
        <View style={styles.listStats}>
          <Text style={styles.listStatsText}>
            {list.totalWords} words • {Math.round(list.progress)}% complete
          </Text>
        </View>
        
        <ProgressBar progress={list.progress} />
        
        <View style={styles.listActions}>
          <TouchableOpacity 
            style={styles.listAction}
            onPress={() => navigateToQuiz(list.id)}
          >
            <GraduationCap size={16} color={COLORS.primary} />
            <Text style={styles.listActionText}>Quiz</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.listAction}
            onPress={() => navigateToListDetail(list.id)}
          >
            <ChevronRight size={16} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {showSearch ? (
          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.darkGray} style={styles.searchIcon} />
            <RNTextInput
              style={styles.searchInput}
              placeholder="Search lists or words..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setShowSearch(false);
              }}
            >
              <X size={20} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Word Lists</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowSearch(true)}
              >
                <Search size={24} color={COLORS.dark} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <SlidersHorizontal size={24} color={COLORS.dark} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      
      {wordLists.length === 0 ? (
        <EmptyState
          title="No Word Lists Yet"
          description="Create your first word list to start learning vocabulary in a personalized way."
          icon={<BookText size={40} color={COLORS.primary} />}
          actionLabel="Create List"
          onAction={navigateToCreateList}
          style={styles.emptyState}
        />
      ) : (
        <FlatList
          data={filteredLists}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Results Found"
              description="Try adjusting your search to find what you're looking for."
              icon={<Search size={40} color={COLORS.primary} />}
              style={styles.emptyState}
            />
          }
        />
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={navigateToCreateList}
        activeOpacity={0.8}
      >
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: THEME.typography.fontSizes.xxl,
    fontWeight: '700',
    color: COLORS.dark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: THEME.spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: THEME.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  listContainer: {
    padding: THEME.spacing.lg,
  },
  listCard: {
    marginBottom: THEME.spacing.md,
  },
  listCardContent: {
    width: '100%',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.xs,
  },
  listTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
  },
  languageFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: THEME.spacing.sm,
  },
  languageFlag: {
    fontSize: 16,
  },
  arrow: {
    marginHorizontal: 4,
    color: COLORS.darkGray,
  },
  listDescription: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.sm,
  },
  listStats: {
    marginBottom: THEME.spacing.xs,
  },
  listStatsText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  listActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.sm,
  },
  listAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  listActionText: {
    marginLeft: THEME.spacing.xs,
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: THEME.spacing.lg,
    right: THEME.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...THEME.shadows.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
  },
});