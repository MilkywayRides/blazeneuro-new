'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface SearchResult {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  ai_score?: number;
}

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [collected, setCollected] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setLoading(true);
      
      try {
        const blogRes = await fetch(`/api/blogs/search?q=${encodeURIComponent(query)}`);
        const blogs = await blogRes.json();
        
        const formattedResults = blogs.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          description: blog.excerpt || blog.content?.substring(0, 150),
          views: blog.views || 0
        }));

        const res = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, results: formattedResults })
        });

        const data = await res.json();
        setResults(data.results || []);
        setAiEnabled(data.aiEnabled);
      } catch (error) {
        console.error('Search error:', error);
      }
      
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClick = async (result: SearchResult, position: number) => {
    try {
      const res = await fetch('/api/ai-search', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          resultId: result.id,
          title: result.title,
          description: result.excerpt || '',
          clicked: true,
          position,
          aiScore: result.ai_score || 0
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setCollected(data.collected);
      }
      
      window.location.href = `/blogs/${result.id}`;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {collected > 0 && (
        <div className={`mb-4 p-4 rounded-lg ${aiEnabled ? 'bg-green-50' : 'bg-blue-50'}`}>
          <p className={`text-sm ${aiEnabled ? 'text-green-700' : 'text-blue-700'}`}>
            {aiEnabled ? '🤖 AI Ranking Active!' : `📊 Collected: ${collected}/10 interactions`}
          </p>
        </div>
      )}

      <Input
        placeholder="Search blogs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6"
      />

      {loading && <div className="text-gray-500">Searching...</div>}

      <div className="space-y-2">
        {results.map((result, idx) => (
          <Card
            key={result.id}
            className="p-4 cursor-pointer hover:shadow-lg hover:bg-gray-50 transition"
            onClick={() => handleClick(result, idx)}
          >
            <div className="flex justify-between items-center gap-4">
              <h3 className="font-semibold text-lg flex-1">{result.title}</h3>
              {result.ai_score !== undefined && (
                <div className="flex-shrink-0 text-sm font-mono bg-blue-100 text-blue-700 px-3 py-1 rounded">
                  {(result.ai_score * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {!loading && query && results.length === 0 && (
        <div className="text-center text-gray-500 mt-8">No results found</div>
      )}
    </div>
  );
}
