import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  SafeAreaView
} from 'react-native';
import { COLORS, THEME } from '@/constants/colors';
import { LANGUAGES, Language } from '@/constants/languages';
import { ChevronDown, X, Search } from 'lucide-react-native';
import Card from './Card';
import TextInput from './TextInput';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (languageCode: string) => void;
  label?: string;
  excludeLanguages?: string[];
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  label,
  excludeLanguages = [],
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedLang = LANGUAGES.find(lang => lang.code === selectedLanguage) || LANGUAGES[0];
  
  const filteredLanguages = LANGUAGES
    .filter(lang => !excludeLanguages.includes(lang.code))
    .filter(lang => 
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  const handleSelectLanguage = (language: Language) => {
    onSelectLanguage(language.code);
    setModalVisible(false);
  };
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectedLanguage}>
          <Text style={styles.flag}>{selectedLang.flag}</Text>
          <Text style={styles.languageName}>{selectedLang.name}</Text>
        </View>
        <ChevronDown size={20} color={COLORS.dark} />
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <X size={24} color={COLORS.dark} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search languages..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                icon={<Search size={20} color={COLORS.mediumGray} />}
                style={styles.searchInput}
              />
            </View>
            
            <FlatList
              data={filteredLanguages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    item.code === selectedLanguage && styles.selectedItem
                  ]}
                  onPress={() => handleSelectLanguage(item)}
                >
                  <Text style={styles.languageFlag}>{item.flag}</Text>
                  <View>
                    <Text style={styles.languageItemName}>{item.name}</Text>
                    <Text style={styles.languageItemNative}>{item.nativeName}</Text>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.languageList}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: '500',
    marginBottom: 6,
    color: COLORS.dark,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  selectedLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 20,
    marginRight: THEME.spacing.sm,
  },
  languageName: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  searchContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  searchInput: {
    backgroundColor: COLORS.lightGray,
  },
  languageList: {
    paddingHorizontal: THEME.spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedItem: {
    backgroundColor: `${COLORS.primary}10`,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: THEME.spacing.md,
  },
  languageItemName: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
    fontWeight: '500',
  },
  languageItemNative: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
});

export default LanguageSelector;