'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  ai_score?: number;
}

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    
    const timer = setTimeout(async () => {
      setLoading(true);
      
      // Mock results - replace with your actual search
      const mockResults = [
        { id: '1', title: 'Neural Networks', description: 'Deep learning basics' },
        { id: '2', title: 'Machine Learning', description: 'ML fundamentals' },
        { id: '3', title: 'AI Research', description: 'Latest AI papers' }
      ];

      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, results: mockResults })
      });

      const data = await res.json();
      setResults(data.results);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClick = async (result: SearchResult, position: number) => {
    await fetch('/api/ai-search', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        resultId: result.id,
        title: result.title,
        description: result.description,
        clicked: true,
        position,
        aiScore: result.ai_score || 0
      })
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Input
        placeholder="Search with AI..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6"
      />

      {loading && <div>Loading...</div>}

      <div className="space-y-4">
        {results.map((result, idx) => (
          <Card
            key={result.id}
            className="p-4 cursor-pointer hover:shadow-lg transition"
            onClick={() => handleClick(result, idx)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{result.title}</h3>
                <p className="text-gray-600">{result.description}</p>
              </div>
              <div className="ml-4 text-sm font-mono bg-blue-100 px-3 py-1 rounded">
                {(result.ai_score || 0).toFixed(3)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
