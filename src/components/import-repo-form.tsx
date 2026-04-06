"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
}

export function ImportRepoForm({ githubConnection, userId }: { githubConnection: any; userId: string }) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [projectName, setProjectName] = useState("");
  const [branch, setBranch] = useState("main");
  const [subdomain, setSubdomain] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchRepos() {
      try {
        const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
          headers: {
            Authorization: `Bearer ${githubConnection.accessToken}`,
          },
        });
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error("Failed to fetch repos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, [githubConnection.accessToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    const repo = repos.find(r => r.full_name === selectedRepo);
    if (!repo) return;

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          repoFullName: repo.full_name,
          repoUrl: repo.html_url,
          branch: branch || repo.default_branch,
          subdomain,
          githubConnectionId: githubConnection.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/deploy/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="repo">Repository</Label>
        <Select value={selectedRepo} onValueChange={(value) => {
          setSelectedRepo(value);
          const repo = repos.find(r => r.full_name === value);
          if (repo) {
            setProjectName(repo.name);
            setBranch(repo.default_branch);
            setSubdomain(repo.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
          }
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select a repository" />
          </SelectTrigger>
          <SelectContent>
            {repos.map((repo) => (
              <SelectItem key={repo.id} value={repo.full_name}>
                {repo.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedRepo && (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <Input
              id="subdomain"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="my-app"
              required
            />
            <p className="text-sm text-muted-foreground">
              Your app will be available at: {subdomain}.blazeneuro.com
            </p>
          </div>

          <Button type="submit" disabled={creating}>
            {creating ? <Spinner className="h-4 w-4 mr-2" /> : null}
            Import & Deploy
          </Button>
        </>
      )}
    </form>
  );
}
