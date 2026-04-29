'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface SearchResult {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
}

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState({ collected: 0, remaining: 10 });

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
        setResults(blogs || []);
      } catch (error) {
        console.error('Search error:', error);
      }
      
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClick = async (result: SearchResult, position: number) => {
    try {
      console.log('Tracking click:', { query, resultId: result.id, title: result.title });
      
      const res = await fetch('/api/ai-search', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          resultId: result.id,
          title: result.title,
          description: result.excerpt || '',
          clicked: true,
          position
        })
      });
      
      const data = await res.json();
      console.log('Tracking response:', data);
      
      if (data.success) {
        setDataStatus({ collected: data.collected, remaining: data.remaining });
        alert(`✅ Recorded! ${data.collected}/10 interactions collected`);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
      
      // Navigate to blog
      setTimeout(() => {
        window.location.href = `/blogs/${result.id}`;
      }, 1000);
    } catch (error) {
      console.error('Click tracking error:', error);
      alert('Error tracking click. Check console.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          📊 Data Collection: {dataStatus.collected}/10 interactions recorded
          {dataStatus.remaining > 0 && ` (${dataStatus.remaining} more needed for AI training)`}
        </p>
      </div>

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
            <h3 className="font-semibold text-lg">{result.title}</h3>
          </Card>
        ))}
      </div>
      
      {!loading && query && results.length === 0 && (
        <div className="text-center text-gray-500 mt-8">No results found</div>
      )}
    </div>
  );
}
