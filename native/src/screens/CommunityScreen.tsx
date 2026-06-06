import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Send } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { Card } from '../components/ui/Card';
import { ContentAPI } from '../lib/api';

const CommunityScreen = () => {
  const theme = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const data = await ContentAPI.getChatMessages();
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    fetchPosts();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const content = message;
    setMessage('');
    try {
      await ContentAPI.sendChatMessage(content);
      fetchPosts();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const renderItem = ({ item }: any) => (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: theme.secondary }]}>
          <Text style={{ color: theme.foreground, fontWeight: 'bold' }}>{item.userName?.[0] || 'U'}</Text>
        </View>
        <View>
          <Text style={[styles.postAuthor, { color: theme.foreground }]}>{item.userName || 'Anonymous'}</Text>
          <Text style={[styles.postTime, { color: theme.muted_foreground }]}>{item.createdAt}</Text>
        </View>
      </View>
      <Text style={[styles.postContent, { color: theme.foreground }]}>{item.content}</Text>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.foreground }]}>Community</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={{ flex: 1 }} />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
            }
            ListEmptyComponent={
              <Text style={{ color: theme.muted_foreground, textAlign: 'center', marginTop: 48 }}>No posts yet. Be the first!</Text>
            }
          />
        )}

        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.secondary }]}>
            <TextInput
              style={[styles.input, { color: theme.foreground }]}
              placeholder="Share your thoughts..."
              placeholderTextColor={theme.muted_foreground}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity 
              onPress={handleSendMessage}
              style={[styles.sendButton, { backgroundColor: theme.primary }]}
            >
              <Send color={theme.primary_foreground} size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  postCard: {
    marginBottom: 16,
    padding: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  postTime: {
    fontSize: 12,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default CommunityScreen;
