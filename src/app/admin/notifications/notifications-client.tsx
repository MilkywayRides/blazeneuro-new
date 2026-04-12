'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, CheckCircle2, XCircle } from "lucide-react";

export default function NotificationsClient() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState('info');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const sendNotification = async () => {
    if (!title || !message) {
      setResult('error:Please fill in all fields');
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
        setResult('success:Notification sent successfully!');
        setTitle('');
        setMessage('');
        setLink('');
      } else {
        setResult(`error:${data.error}`);
      }
    } catch (error: any) {
      setResult(`error:${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send Push Notification</CardTitle>
            <CardDescription>Send notifications to all mobile app users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notification message"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (Optional)</Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://blazeneuro.com/blogs/example"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="mention">Mention</SelectItem>
                  <SelectItem value="reply">Reply</SelectItem>
                  <SelectItem value="like">Like</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={sendNotification} disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send Notification'}
            </Button>

            {result && (
              <Alert variant={result.startsWith('success') ? 'default' : 'destructive'}>
                {result.startsWith('success') ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{result.split(':')[1]}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How the notification will appear on devices</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-[360px] h-[640px] border-[14px] border-gray-800 rounded-[40px] shadow-2xl bg-white dark:bg-gray-900 overflow-hidden relative">
              {/* Status bar */}
              <div className="h-6 bg-gray-100 dark:bg-gray-800 flex items-center justify-between px-6 text-xs">
                <span>9:41</span>
                <div className="flex gap-1">
                  <div className="w-4 h-3 border border-current rounded-sm" />
                  <div className="w-3 h-3 border border-current rounded-full" />
                </div>
              </div>
              
              {/* Notification */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {title || 'Notification Title'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {message || 'Your notification message will appear here'}
                      </p>
                      {link && (
                        <p className="text-xs text-blue-500 truncate mt-1">{link}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">now</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Screen content */}
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
