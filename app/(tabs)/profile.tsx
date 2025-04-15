import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, THEME } from '@/constants/colors';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import Card from '@/components/ui/Card';
import { 
  User, 
  Settings, 
  BarChart, 
  Moon, 
  Bell, 
  Languages, 
  HelpCircle,
  ChevronRight,
  LogOut
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { userStats, userSettings, updateUserSettings } = useAppStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  
  const navigateToStats = () => {
    router.push('/profile/stats');
  };
  
  const navigateToSettings = () => {
    router.push('/profile/settings');
  };
  
  const navigateToQuizHistory = () => {
    router.push('/quiz');
  };
  
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
  
  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Sign Out", 
          onPress: () => {
            logout();
            router.replace('/auth/login');
          },
          style: "destructive"
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {user?.profilePicture ? (
              <Image 
                source={{ uri: user.profilePicture }} 
                style={styles.profileImage} 
              />
            ) : (
              <User size={40} color={COLORS.white} />
            )}
          </View>
          <Text style={styles.username}>{user?.name || "Pecklet User"}</Text>
          <Text style={styles.userLevel}>
            Level {userStats.level} • {userStats.totalXp} XP
          </Text>
          
          {userStats.streak > 0 && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>
                🔥 {userStats.streak} day{userStats.streak !== 1 ? 's' : ''} streak
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.statsOverview}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.listsCreated}</Text>
            <Text style={styles.statLabel}>Lists</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.wordsLearned}</Text>
            <Text style={styles.statLabel}>Words Learned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.quizzesTaken}</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToStats}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: `${COLORS.info}15` }]}>
                <BarChart size={20} color={COLORS.info} />
              </View>
              <Text style={styles.menuItemText}>View Statistics</Text>
            </View>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToQuizHistory}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                <BarChart size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuItemText}>View Quiz History</Text>
            </View>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: `${COLORS.darkGray}15` }]}>
                <Moon size={20} color={COLORS.darkGray} />
              </View>
              <Text style={styles.menuItemText}>Dark Mode</Text>
            </View>
            <Switch
              value={userSettings.theme === 'dark'}
              onValueChange={toggleDarkMode}
              trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}80` }}
              thumbColor={userSettings.theme === 'dark' ? COLORS.primary : COLORS.white}
            />
          </View>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: `${COLORS.warning}15` }]}>
                <Bell size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Switch
              value={userSettings.notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}80` }}
              thumbColor={userSettings.notifications ? COLORS.primary : COLORS.white}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToSettings}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: `${COLORS.secondary}15` }]}>
                <Settings size={20} color={COLORS.secondary} />
              </View>
              <Text style={styles.menuItemText}>All Settings</Text>
            </View>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: `${COLORS.info}15` }]}>
                <HelpCircle size={20} color={COLORS.info} />
              </View>
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: `${COLORS.error}15` }]}>
                <LogOut size={20} color={COLORS.error} />
              </View>
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
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
    paddingBottom: THEME.spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xl,
    backgroundColor: COLORS.primary,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: THEME.spacing.xs,
  },
  userLevel: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  streakContainer: {
    marginTop: THEME.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.sm,
  },
  streakText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  statsOverview: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    marginHorizontal: THEME.spacing.lg,
    marginTop: -THEME.spacing.lg,
    padding: THEME.spacing.md,
    ...THEME.shadows.medium,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: '700',
    color: COLORS.dark,
  },
  statLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.lightGray,
    alignSelf: 'center',
  },
  section: {
    marginTop: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: THEME.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  menuItemText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.dark,
  },
  versionText: {
    textAlign: 'center',
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.darkGray,
    marginTop: THEME.spacing.lg,
  },
});