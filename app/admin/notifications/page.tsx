'use client';

import { useState } from 'react';

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState('info');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const sendNotification = async () => {
    if (!title || !message) {
      setResult('Please fill in all fields');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/admin/push-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type, link: link || null }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult(`✓ Notification sent successfully!`);
        setTitle('');
        setMessage('');
        setLink('');
      } else {
        setResult(`✗ Error: ${data.error}`);
      }
    } catch (error: any) {
      setResult(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Push Notifications</h1>
        
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-md"
              placeholder="Notification title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-md h-32"
              placeholder="Notification message"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Link (Optional)</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-md"
              placeholder="https://blazeneuro.com/blogs/example"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-md"
            >
              <option value="info">Info</option>
              <option value="mention">Mention</option>
              <option value="reply">Reply</option>
              <option value="like">Like</option>
            </select>
          </div>

          <button
            onClick={sendNotification}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </button>

          {result && (
            <div className={`p-3 rounded-md ${result.startsWith('✓') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
