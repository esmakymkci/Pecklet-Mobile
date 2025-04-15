import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import TextInput from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Check, X } from 'lucide-react-native';

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
  
  const validateForm = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    if (sourceLanguage === targetLanguage) {
      isValid = false;
      // Show an error message
    }
    
    return isValid;
  };
  
  const handleCreateList = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Create the list
    addWordList({
      title: title.trim(),
      description: description.trim(),
      context: context.trim(),
      sourceLanguage,
      targetLanguage,
      words: [],
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
            <Text style={styles.sectionTitle}>Templates</Text>
            <Text style={styles.sectionDescription}>
              Start with a template or create from scratch
            </Text>
            
            <View style={styles.templateGrid}>
              <TouchableOpacity 
                style={styles.templateCard}
                activeOpacity={0.7}
              >
                <Text style={styles.templateTitle}>Travel</Text>
                <Text style={styles.templateCount}>20 common words</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.templateCard}
                activeOpacity={0.7}
              >
                <Text style={styles.templateTitle}>Food</Text>
                <Text style={styles.templateCount}>25 common words</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.templateCard}
                activeOpacity={0.7}
              >
                <Text style={styles.templateTitle}>Business</Text>
                <Text style={styles.templateCount}>30 common words</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.templateCard}
                activeOpacity={0.7}
              >
                <Text style={styles.templateTitle}>Casual</Text>
                <Text style={styles.templateCount}>15 common words</Text>
              </TouchableOpacity>
            </View>
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
});