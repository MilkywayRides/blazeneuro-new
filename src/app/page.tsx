"use client"

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import { MainNav } from "@/components/main-nav";
import { MeshGradient } from '@paper-design/shaders-react';
import { Play, Pause, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [isPaused, setIsPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsPaused(localStorage.getItem('bgPaused') === 'true');
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('bgPaused', String(isPaused));
    }
  }, [isPaused, mounted]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleSearch(query: string) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="relative">
      <div className="relative min-h-screen flex flex-col">
        <header className={`fixed left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled ? 'top-0' : 'top-2 md:top-6'
        }`}>
          <div className={`mx-auto transition-all duration-700 ${
            isScrolled ? 'w-full' : 'w-[95%] md:w-[91%]'
          }`}>
            <div className={`relative flex justify-between items-center p-3 md:p-4 transition-all duration-700 ${
              isScrolled ? 'rounded-none' : 'rounded-full'
            } overflow-hidden`}>
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute inset-0" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', opacity: 1, maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></span>
                <span className="absolute inset-0" style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', opacity: 0.8, maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></span>
                <span className="absolute inset-0" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', opacity: 0.6, maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></span>
                <span className="absolute inset-0" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', opacity: 0.4, maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></span>
                <span className="absolute inset-0" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', opacity: 0.2, maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></span>
              </div>
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent)'
              }}></div>
              <h2 className="relative text-lg md:text-2xl font-bold ml-2 md:ml-8">BlazeNeuro</h2>
              <div className="relative flex items-center gap-2 md:gap-4 mr-2 md:mr-8">
                <MainNav />
                <ModeToggle />
              </div>
            </div>
          </div>
        </header>
        
        <section className={`relative min-h-screen flex items-center justify-center px-4`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[95%] md:w-[90%] h-[70%] md:h-[80%] rounded-2xl md:rounded-3xl overflow-hidden">
              {!mounted ? (
                <Skeleton className="w-full h-full rounded-2xl md:rounded-3xl" />
              ) : (
                <MeshGradient
                  width={1800}
                  height={900}
                  colors={["#e0eaff", "#241d9a", "#f75092", "#9f50d3"]}
                  distortion={0.96}
                  swirl={0}
                  grainMixer={1}
                  grainOverlay={0.5}
                  speed={isPaused ? 0 : 1}
                  scale={0.72}
                  rotation={144}
                  offsetY={-0.2}
                />
              )}
              <Button
                size="icon"
                variant="outline"
                className="absolute bottom-3 right-3 md:bottom-4 md:right-4 rounded-full h-8 w-8 md:h-10 md:w-10"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-3 w-3 md:h-4 md:w-4" /> : <Pause className="h-3 w-3 md:h-4 md:w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="relative text-center z-10 px-4">
            <Badge className="mb-4 md:mb-6 bg-white/10 backdrop-blur-md border-white/20 text-white text-xs md:text-sm">AI-Powered Neural Solutions</Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 text-white [text-shadow:_0_4px_20px_rgb(0_0_0_/_40%)]">
              BlazeNeuro
            </h1>
            <p className="text-base md:text-xl text-white/95 max-w-2xl mx-auto mb-6 md:mb-8 [text-shadow:_0_2px_12px_rgb(0_0_0_/_30%)]">
              Next-generation neural solutions for modern applications. Fast, scalable, and secure.
            </p>
            
            <div className="max-w-2xl mx-auto mb-8 md:mb-10 relative z-50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white z-10 pointer-events-none" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  defaultValue=""
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documentation, guides, and APIs..."
                  className="w-full pl-11 pr-20 h-11 rounded-full !bg-black/80 backdrop-blur-lg border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/50 focus-visible:!bg-black/80 shadow-2xl"
                />
                <kbd className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/70">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
              
              {searchQuery && (
                <div className="absolute top-full left-0 mt-2 w-full bg-black/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl max-h-96 overflow-y-auto text-left">
                  {searching ? (
                    <div className="p-4 text-center text-white/60">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((result) => (
                        <a
                          key={result.id}
                          href={`/blogs/${result.slug}`}
                          className="block p-3 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <h3 className="text-white font-medium">{result.title}</h3>
                          
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-white/60">No results found</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <a href="https://auth.blazeneuro.com/login">
                <Button size="lg" className="shadow-lg w-full sm:w-auto">Get Started</Button>
              </a>
              <Button size="lg" variant="outline" className="backdrop-blur-md bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto">Learn More</Button>
            </div>
          </div>
        </section>
        
        <footer className="bg-background/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 mb-8 md:mb-12">
              <div className="col-span-2 md:col-span-2">
                <h3 className="font-bold text-xl md:text-2xl mb-3 md:mb-4">BlazeNeuro</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-sm">Next-generation neural solutions for modern applications.</p>
              </div>
              <div className="col-span-1">
                <h4 className="font-semibold mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider">Product</h4>
                <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Docs</a></li>
                </ul>
              </div>
              <div className="col-span-1">
                <h4 className="font-semibold mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider">Company</h4>
                <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                  <li><a href="/blogs" className="hover:text-foreground transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h4 className="font-semibold mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider">Resources</h4>
                <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center mb-6 md:mb-8 overflow-hidden">
              <h2 className="text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] font-bold text-muted-foreground/20 leading-none whitespace-nowrap">
                BlazeNeuro
              </h2>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-muted-foreground">
              <p>© 2026 BlazeNeuro. All rights reserved.</p>
              <div className="flex gap-4 md:gap-6">
                <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
