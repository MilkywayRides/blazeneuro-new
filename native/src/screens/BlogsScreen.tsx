import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/colors';
import { Card } from '../components/ui/Card';
import { ContentAPI } from '../lib/api';

const BlogsScreen = () => {
  const theme = useTheme();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBlogs = async () => {
    try {
      const data = await ContentAPI.getBlogs();
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    fetchBlogs();
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.7}>
      <Card style={styles.blogCard}>
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.secondary }]} />
        <View style={styles.cardHeader}>
          <Text style={[styles.date, { color: theme.muted_foreground }]}>
            {item.createdAt} • {item.readTime} min read
          </Text>
          <Text style={[styles.blogTitle, { color: theme.foreground }]}>{item.title}</Text>
          {item.description && (
            <Text style={[styles.blogDesc, { color: theme.muted_foreground }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.cardFooter}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={{ color: theme.primary_foreground, fontSize: 10 }}>{item.authorName?.[0] || 'B'}</Text>
          </View>
          <Text style={[styles.author, { color: theme.foreground }]}>{item.authorName || 'BlazeNeuro'}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.foreground }]}>Latest Blogs</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={blogs}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <Text style={{ color: theme.muted_foreground, textAlign: 'center', marginTop: 48 }}>No blogs found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  blogCard: {
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 160,
    width: '100%',
  },
  cardHeader: {
    padding: 16,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  blogDesc: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  author: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default BlogsScreen;
