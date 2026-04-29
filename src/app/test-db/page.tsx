'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState('');

  const testInsert = async () => {
    try {
      const res = await fetch('/api/test-insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'test query',
          resultId: `test-${Date.now()}`,
          title: 'Test Blog Title'
        })
      });
      
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult('Error: ' + error.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Insert Test</h1>
      <button 
        onClick={testInsert}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Insert
      </button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {result}
        </pre>
      )}
    </div>
  );
}
