import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ContentAPI } from '../lib/api';

const SearchScreen = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await ContentAPI.getTrending();
        setTrending(data || []);
      } catch (error) {
        console.error('Error fetching trending:', error);
      }
    };
    fetchTrending();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await ContentAPI.search(query);
      setResults(data || []);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.searchWrapper}>
          <Input
            placeholder="Search blogs..."
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
          <View style={styles.searchIcon}>
            <Search color={theme.muted_foreground} size={18} />
          </View>
        </View>

        {searchQuery.length < 3 ? (
          <>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Trending Searches</Text>
            <View style={styles.trendingContainer}>
              {trending.map((item) => (
                <TouchableOpacity 
                  key={item} 
                  onPress={() => handleSearch(item)}
                  style={[styles.trendingChip, { backgroundColor: theme.secondary, borderRadius: theme.radius / 2 }]}
                >
                  <Text style={[styles.trendingText, { color: theme.foreground }]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={{ flex: 1, marginTop: 24 }}>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Results</Text>
            {isLoading ? (
              <ActivityIndicator color={theme.primary} style={{ marginTop: 24 }} />
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Card style={styles.resultItem}>
                    <Text style={[styles.resultTitle, { color: theme.foreground }]}>{item.title}</Text>
                    {item.description && (
                      <Text style={[styles.resultDesc, { color: theme.muted_foreground }]} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                  </Card>
                )}
                ListEmptyComponent={
                  <Text style={{ color: theme.muted_foreground, textAlign: 'center', marginTop: 48 }}>No results found</Text>
                }
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    flex: 1,
  },
  searchWrapper: {
    position: 'relative',
  },
  searchInput: {
    paddingLeft: 44,
    height: 52,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 16,
  },
  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trendingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultItem: {
    marginBottom: 12,
    padding: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultDesc: {
    fontSize: 13,
    marginTop: 4,
  },
});

export default SearchScreen;
