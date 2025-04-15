import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import Card from '@/components/ui/Card';
import LanguageSelector from '@/components/ui/LanguageSelector';
import TextInput from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Moon, 
  Bell, 
  Volume2, 
  Clock, 
  Download, 
  Upload, 
  Trash2,
  User,
  Mail,
  Camera
} from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { userSettings, updateUserSettings } = useAppStore();
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const toggleDarkMode = () => {
    updateUserSettings({ 
      theme: userSettings.theme === 'dark' ? 'light' : 'dark' 
    });
  };
  
  const toggleNotifications = () => {
    updateUserSettings({ 
      notifications: !userSettings.notifications 
    });
  };
  
  const toggleSoundEffects = () => {
    updateUserSettings({ 
      soundEffects: !userSettings.soundEffects 
    });
  };
  
  const handleSourceLanguageChange = (code: string) => {
    updateUserSettings({ defaultSourceLanguage: code });
  };
  
  const handleTargetLanguageChange = (code: string) => {
    updateUserSettings({ defaultTargetLanguage: code });
  };
  
  const handleDailyGoalChange = (goal: number) => {
    updateUserSettings({ dailyGoal: goal });
  };
  
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };
  
  const handleSaveProfile = async () => {
    try {
      if (user) {
        await updateProfile({
          ...user,
          name,
          // Email update would typically require verification
          // email
        });
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };
  
  const handleChangeProfilePicture = () => {
    Alert.alert(
      "Change Profile Picture",
      "This feature is not available in the demo version",
      [{ text: "OK" }]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            Alert.alert("Account Deletion", "This feature is not available in the demo version");
          },
          style: "destructive"
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Settings',
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
        <Text style={styles.sectionTitle}>Profile</Text>
        
        <Card variant="outlined" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {user?.profilePicture ? (
                <Image 
                  source={{ uri: user.profilePicture }} 
                  style={styles.profileImage} 
                />
              ) : (
                <User size={40} color={COLORS.darkGray} />
              )}
              
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={handleChangeProfilePicture}
              >
                <Camera size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            
            {!isEditing ? (
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || "Pecklet User"}</Text>
                <Text style={styles.profileEmail}>{user?.email || "user@example.com"}</Text>
                
                <Button
                  title="Edit Profile"
                  onPress={handleEditProfile}
                  variant="outline"
                  size="sm"
                  style={styles.editButton}
                />
              </View>
            ) : (
              <View style={styles.editForm}>
                <TextInput
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  icon={<User size={20} color={COLORS.darkGray} />}
                />
                
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon={<Mail size={20} color={COLORS.darkGray} />}
                  editable={false} // Email changes typically require verification
                />
                
                <View style={styles.editButtons}>
                  <Button
                    title="Cancel"
                    onPress={handleCancelEdit}
                    variant="outline"
                    size="sm"
                    style={styles.cancelButton}
                  />
                  
                  <Button
                    title="Save"
                    onPress={handleSaveProfile}
                    size="sm"
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.saveButton}
                  />
                </View>
              </View>
            )}
          </View>
        </Card>
        
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <Card variant="outlined" style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${COLORS.darkGray}15` }]}>
                <Moon size={20} color={COLORS.darkGray} />
              </View>
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={userSettings.theme === 'dark'}
              onValueChange={toggleDarkMode}
              trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}80` }}
              thumbColor={userSettings.theme === 'dark' ? COLORS.primary : COLORS.white}
            />
          </View>
        </Card>
        
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <Card variant="outlined" style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${COLORS.warning}15` }]}>
                <Bell size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.settingText}>Enable Notifications</Text>
            </View>
            <Switch
              value={userSettings.notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}80` }}
              thumbColor={userSettings.notifications ? COLORS.primary : COLORS.white}
            />
          </View>
        </Card>
        
        <Text style={styles.sectionTitle}>Sound</Text>
        
        <Card variant="outlined" style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${COLORS.info}15` }]}>
                <Volume2 size={20} color={COLORS.info} />
              </View>
              <Text style={styles.settingText}>Sound Effects</Text>
            </View>
            <Switch
              value={userSettings.soundEffects}
              onValueChange={toggleSoundEffects}
              trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}80` }}
              thumbColor={userSettings.soundEffects ? COLORS.primary : COLORS.white}
            />
          </View>
        </Card>
        
        <Text style={styles.sectionTitle}>Language Preferences</Text>
        
        <Card variant="outlined" style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>I speak</Text>
          </View>
          
          <LanguageSelector
            selectedLanguage={userSettings.defaultSourceLanguage}
            onSelectLanguage={handleSourceLanguageChange}
            excludeLanguages={[userSettings.defaultTargetLanguage]}
          />
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>I want to learn</Text>
          </View>
          
          <LanguageSelector
            selectedLanguage={userSettings.defaultTargetLanguage}
            onSelectLanguage={handleTargetLanguageChange}
            excludeLanguages={[userSettings.defaultSourceLanguage]}
          />
        </Card>
        
        <Text style={styles.sectionTitle}>Learning Goals</Text>
        
        <Card variant="outlined" style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${COLORS.success}15` }]}>
                <Clock size={20} color={COLORS.success} />
              </View>
              <Text style={styles.settingText}>Daily Goal</Text>
            </View>
          </View>
          
          <View style={styles.goalOptions}>
            {[5, 10, 15, 20].map(goal => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalOption,
                  userSettings.dailyGoal === goal && styles.selectedGoalOption
                ]}
                onPress={() => handleDailyGoalChange(goal)}
              >
                <Text 
                  style={[
                    styles.goalOptionText,
                    userSettings.dailyGoal === goal && styles.selectedGoalOptionText
                  ]}
                >
                  {goal} words
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
        
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <Card variant="outlined" style={styles.settingsCard}>
          <TouchableOpacity style={styles.dataRow} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                <Download size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.settingText}>Export Data</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dataRow} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${COLORS.secondary}15` }]}>
                <Upload size={20} color={COLORS.secondary} />
              </View>
              <Text style={styles.settingText}>Import Data</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dataRow} 
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${COLORS.error}15` }]}>
                <Trash2 size={20} color={COLORS.error} />
              </View>
              <Text style={[styles.settingText, { color: COLORS.error }]}>
                Delete Account
              </Text>
            </View>
          </TouchableOpacity>
        </Card>
        
        <Text style={styles.versionText}>Pecklet v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.sm,
    marginTop: THEME.spacing.md,
  },
  profileCard: {
    marginBottom: THEME.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.sm,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.xs,
  },
  profileEmail: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginBottom: THEME.spacing.sm,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  editForm: {
    flex: 1,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: THEME.spacing.sm,
  },
  cancelButton: {
    marginRight: THEME.spacing.sm,
  },
  saveButton: {
    minWidth: 80,
  },
  settingsCard: {
    marginBottom: THEME.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  settingText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  settingLabel: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
    fontWeight: '500',
  },
  goalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  goalOption: {
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: COLORS.lightGray,
    marginRight: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  selectedGoalOption: {
    backgroundColor: COLORS.primary,
  },
  goalOptionText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  selectedGoalOptionText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  dataRow: {
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  versionText: {
    textAlign: 'center',
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginTop: THEME.spacing.lg,
  },
});