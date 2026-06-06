import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, SafeAreaView, ActivityIndicator } from 'react-native';
import { Menu, Bell, Grid, List } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { Card } from '../components/ui/Card';
import { ContentAPI } from '../lib/api';

const HomeScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [userName, setUserName] = useState('User');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  const fetchData = async () => {
    try {
      const data = await ContentAPI.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.secondary, borderRadius: 8 }]}>
            <Menu color={theme.foreground} size={20} />
          </TouchableOpacity>
          
          <Text style={[styles.title, { color: theme.foreground }]}>Welcome, {userName}</Text>
          
          <View>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.secondary, borderRadius: 8 }]}>
              <Bell color={theme.foreground} size={20} />
            </TouchableOpacity>
            <View style={[styles.notificationBadge, { backgroundColor: theme.destructive }]} />
          </View>
        </View>

        <Text style={[styles.subtitle, { color: theme.muted_foreground }]}>Your Dashboard</Text>

        <Card style={styles.carouselPlaceholder}>
          <Text style={{ color: theme.muted_foreground, fontWeight: '500' }}>Featured Content</Text>
        </Card>
        
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, { backgroundColor: theme.primary }]} />
          <View style={[styles.dot, { backgroundColor: theme.border }]} />
          <View style={[styles.dot, { backgroundColor: theme.border }]} />
        </View>

        <View style={styles.coursesHeader}>
          <Text style={[styles.coursesTitle, { color: theme.foreground }]}>Available Courses</Text>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.secondary, borderRadius: 8 }]} 
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            {viewMode === 'list' ? <Grid color={theme.foreground} size={20} /> : <List color={theme.foreground} size={20} />}
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 24 }} />
        ) : (
          <View style={viewMode === 'grid' ? styles.grid : styles.list}>
            {courses.map((course: any) => (
              <Card key={course.id} style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
                <View style={[styles.itemImage, { backgroundColor: theme.secondary }]} />
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, { color: theme.foreground }]} numberOfLines={1}>{course.title}</Text>
                  <Text style={[styles.itemSubtitle, { color: theme.muted_foreground }]}>{course.pageCount} pages • {course.type}</Text>
                </View>
              </Card>
            ))}
            {courses.length === 0 && (
              <Text style={{ color: theme.muted_foreground, textAlign: 'center', marginTop: 24 }}>No courses available</Text>
            )}
          </View>
        )}

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
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
    letterSpacing: -0.5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  carouselPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  coursesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  coursesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    padding: 12,
  },
  list: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 12,
  },
});

export default HomeScreen;
