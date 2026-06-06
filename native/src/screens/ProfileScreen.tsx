import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, useColorScheme } from 'react-native';
import { User, Shield, Bell, Moon, Globe, Database, HelpCircle, Info, FileText, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AuthAPI } from '../lib/api';

const ProfileScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const scheme = useColorScheme();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await AuthAPI.signOut();
        navigation.replace('Welcome');
      }},
    ]);
  };

  const ProfileItem = ({ label, value, Icon, color }: any) => (
    <TouchableOpacity style={[styles.profileItem, { borderBottomColor: theme.border }]}>
      <View style={styles.profileItemLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: color || theme.secondary }]}>
          <Icon color={color ? '#fff' : theme.foreground} size={18} />
        </View>
        <Text style={[styles.profileItemLabel, { color: theme.foreground }]}>{label}</Text>
      </View>
      <View style={styles.profileItemRight}>
        <Text style={[styles.profileItemValue, { color: theme.muted_foreground }]}>{value}</Text>
        <ChevronRight color={theme.muted_foreground} size={18} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.headerTitle, { color: theme.foreground }]}>Profile</Text>
        
        <View style={styles.profileHeader}>
          <View style={[styles.avatarLarge, { backgroundColor: theme.primary }]}>
            <Text style={{ color: theme.primary_foreground, fontSize: 32, fontWeight: 'bold' }}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: theme.foreground }]}>John Doe</Text>
            <Text style={[styles.userEmail, { color: theme.muted_foreground }]}>john.doe@blazeneuro.com</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Account</Text>
        <Card style={styles.sectionCard}>
          <ProfileItem label="Personal Information" Icon={User} color="#3b82f6" />
          <ProfileItem label="Security" Icon={Shield} color="#10b981" />
          <ProfileItem label="Notifications" Icon={Bell} color="#f59e0b" value="On" />
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Preferences</Text>
        <Card style={styles.sectionCard}>
          <ProfileItem label="Appearance" Icon={Moon} color="#6366f1" value={scheme === 'dark' ? 'Dark' : 'Light'} />
          <ProfileItem label="Language" Icon={Globe} color="#8b5cf6" value="English" />
          <ProfileItem label="Storage" Icon={Database} color="#ec4899" value="1.2 GB" />
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Support</Text>
        <Card style={styles.sectionCard}>
          <ProfileItem label="Help Center" Icon={HelpCircle} />
          <ProfileItem label="About BlazeNeuro" Icon={Info} />
          <ProfileItem label="Privacy Policy" Icon={FileText} />
        </Card>

        <Button
          title="Logout"
          variant="destructive"
          onPress={handleLogout}
          style={{ marginTop: 24, marginBottom: 40 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileItemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItemValue: {
    fontSize: 14,
    marginRight: 8,
  },
});

export default ProfileScreen;
