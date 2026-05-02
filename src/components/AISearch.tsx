'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Sparkles, Send, ExternalLink, ThumbsUp, BookOpen, Lightbulb, CheckCircle2, SearchX } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  ai_score?: number;
}

interface Contribution {
  id: string;
  query: string;
  title: string;
  description: string;
  links?: string;
  tags?: string[];
  upvotes: number;
  createdAt: string;
}

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [untrained, setUntrained] = useState(0);
  const [source, setSource] = useState<'cache' | 'learning' | 'contributions' | 'none'>('none');
  const [message, setMessage] = useState('');
  const [noResults, setNoResults] = useState(false);

  // Contribution dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contribTitle, setContribTitle] = useState('');
  const [contribDesc, setContribDesc] = useState('');
  const [contribLinks, setContribLinks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setContributions([]);
      setNoResults(false);
      setSource('none');
      setSubmitted(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setSubmitted(false);

      try {
        const res = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, results: [] })
        });

        const data = await res.json();
        setResults(data.results || []);
        setContributions(data.contributions || []);
        setSource(data.source);
        setMessage(data.message || '');
        setNoResults(data.noResults || false);
      } catch (error) {
        console.error('Search error:', error);
      }

      setLoading(false);
    }, 400);

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
        setUntrained(data.untrained || 0);
        if (data.trained) {
          if (source === 'learning') {
            alert('🎉 Learned new keyword! AI now knows what you like for this search.');
          } else {
            alert('🎉 AI retrained! Scores updated with latest user behavior.');
          }
        }
      }

      window.location.href = `/blogs/${result.id}`;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmitContribution = useCallback(async () => {
    if (!contribTitle || !contribDesc) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/ai-search', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          title: contribTitle,
          description: contribDesc,
          links: contribLinks || null,
          tags: query.toLowerCase().split(/\s+/).filter(t => t.length > 2)
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setDialogOpen(false);
        setContribTitle('');
        setContribDesc('');
        setContribLinks('');
      }
    } catch (error) {
      console.error('Contribution error:', error);
    }
    setSubmitting(false);
  }, [query, contribTitle, contribDesc, contribLinks]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Learning mode banner */}
      {message && source === 'learning' && (
        <div className="mb-4 p-4 rounded-lg bg-accent border border-border">
          <p className="text-sm text-foreground font-medium">
            🎓 {message}
          </p>
        </div>
      )}

      {untrained > 0 && source !== 'learning' && source !== 'none' && (
        <div className="mb-4 p-4 rounded-lg bg-accent border border-border">
          <p className="text-sm text-muted-foreground">
            {source === 'cache'
              ? '✨ AI Scores (from cache)'
              : `📊 Collecting: ${untrained}/10 for next training`}
          </p>
        </div>
      )}

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="ai-search-input"
          placeholder="Search blogs, topics, anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <div className="ai-search-spinner" />
          <span>Searching...</span>
        </div>
      )}

      {/* Blog results */}
      <div className="space-y-2">
        {results.map((result, idx) => (
          <Card
            key={result.id}
            className="p-4 cursor-pointer hover:shadow-lg hover:bg-accent transition"
            onClick={() => handleClick(result, idx)}
          >
            <div className="flex justify-between items-center gap-4">
              <h3 className="font-semibold text-lg flex-1">{result.title}</h3>
              {result.ai_score !== undefined && (
                <Badge variant="secondary" className="font-mono">
                  {(result.ai_score * 100).toFixed(1)}%
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Contributions from other users */}
      {source === 'contributions' && contributions.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-foreground">Community Knowledge</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          <div className="space-y-3">
            {contributions.map((contrib) => (
              <Card key={contrib.id} className="ai-search-contribution-card p-5 border border-purple-500/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
                      <h4 className="font-semibold text-base text-foreground truncate">{contrib.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {contrib.description}
                    </p>
                    {contrib.links && (
                      <a
                        href={contrib.links}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {contrib.links}
                      </a>
                    )}
                    {contrib.tags && contrib.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {contrib.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-300 border-purple-500/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span className="text-xs">{contrib.upvotes}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===== NO RESULTS — HELP US IMPROVE ===== */}
      {!loading && query && (noResults || (results.length === 0 && source === 'none')) && !submitted && (
        <div className="ai-search-no-results mt-8">
          <div className="ai-search-no-results-inner">
            {/* Animated search icon */}
            <div className="ai-search-icon-wrapper">
              <SearchX className="ai-search-icon h-12 w-12 text-muted-foreground/50" />
              <div className="ai-search-icon-ring" />
            </div>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">
              No results for &ldquo;{query}&rdquo;
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn&apos;t find any content matching your search. Your knowledge can help future searchers!
            </p>

            <Button
              id="help-improve-btn"
              onClick={() => setDialogOpen(true)}
              className="ai-search-improve-btn gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Help Us Improve
            </Button>
          </div>
        </div>
      )}

      {/* Success state after contribution */}
      {submitted && (
        <div className="ai-search-success mt-8">
          <div className="ai-search-success-inner">
            <div className="ai-search-success-icon-wrapper">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
              Thank you!
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your contribution will help other users searching for &ldquo;{query}&rdquo;.
              The AI learns from every contribution to deliver better results.
            </p>
          </div>
        </div>
      )}

      {/* ===== CONTRIBUTION DIALOG ===== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Share Your Knowledge
            </DialogTitle>
            <DialogDescription>
              Tell us about &ldquo;{query}&rdquo; — your input helps train the AI to deliver better results for everyone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="contrib-title" className="text-sm font-medium text-foreground mb-1.5 block">
                What is this topic about?
              </label>
              <Input
                id="contrib-title"
                placeholder="e.g., A guide to quantum computing fundamentals"
                value={contribTitle}
                onChange={(e) => setContribTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="contrib-desc" className="text-sm font-medium text-foreground mb-1.5 block">
                Describe what you were looking for
              </label>
              <Textarea
                id="contrib-desc"
                placeholder="Describe the topic, what kind of content would be helpful, and any specific aspects you're interested in..."
                value={contribDesc}
                onChange={(e) => setContribDesc(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label htmlFor="contrib-links" className="text-sm font-medium text-foreground mb-1.5 block">
                Any helpful links? <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                id="contrib-links"
                placeholder="https://example.com/relevant-resource"
                value={contribLinks}
                onChange={(e) => setContribLinks(e.target.value)}
              />
            </div>

            {/* Auto-generated tags preview */}
            {query && (
              <div>
                <span className="text-xs text-muted-foreground">Auto-tags:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {query.toLowerCase().split(/\s+/).filter(t => t.length > 2).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-300 border-purple-500/20">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              id="submit-contribution-btn"
              onClick={handleSubmitContribution}
              disabled={submitting || !contribTitle || contribDesc.length < 10}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <div className="ai-search-spinner-sm" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Contribution
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
