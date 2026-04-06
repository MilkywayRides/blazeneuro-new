"use client"

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeaderClient } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Copy, FileText } from "lucide-react";
import { useParams } from "next/navigation";

const generateImplementationPrompt = (app: any) => {
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000"
  return `I need to implement "Sign in with BlazeNeuro" OAuth 2.0 authentication in my application. Here are my credentials:

**My OAuth Application:**
- Name: ${app.name}
- Client ID: ${app.clientId}
- Client Secret: ${app.clientSecret}
- Callback URL: ${app.callbackUrl}

**BlazeNeuro OAuth Endpoints:**
- Authorization: ${authUrl}/oauth/v1/authorize
- Token Exchange: ${authUrl}/oauth/v1/token
- User Info: ${authUrl}/oauth/v1/userinfo
- Discovery: ${authUrl}/.well-known/openid-configuration

**OAuth 2.0 Authorization Code Flow:**

1. **Redirect user to authorization:**
\`\`\`
${authUrl}/oauth/v1/authorize?client_id=${app.clientId}&redirect_uri=${encodeURIComponent(app.callbackUrl)}&response_type=code&state=RANDOM_STATE&scope=openid%20profile%20email
\`\`\`

2. **User signs in with BlazeNeuro** (Google, GitHub, or Email)

3. **Handle callback** at ${app.callbackUrl} with code and state parameters

4. **Exchange code for tokens:**
\`\`\`
POST ${authUrl}/oauth/v1/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "AUTHORIZATION_CODE",
  "redirect_uri": "${app.callbackUrl}",
  "client_id": "${app.clientId}",
  "client_secret": "${app.clientSecret}"
}
\`\`\`

Response:
\`\`\`json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "id_token": "...",
  "scope": "openid profile email"
}
\`\`\`

5. **Get user info:**
\`\`\`
GET ${authUrl}/oauth/v1/userinfo
Authorization: Bearer ACCESS_TOKEN
\`\`\`

Response:
\`\`\`json
{
  "sub": "user_id",
  "email": "user@example.com",
  "email_verified": true,
  "name": "User Name",
  "picture": "https://..."
}
\`\`\`

**Available Scopes:**
- \`openid\` - User ID (required)
- \`profile\` - Name, picture
- \`email\` - Email address, verification status

**Security Requirements:**
- Always validate the \`state\` parameter to prevent CSRF attacks
- Store client_secret securely (server-side only, never in frontend)
- Use HTTPS in production
- Validate token expiration

Please provide a complete implementation for my tech stack with:
- Authorization redirect with state parameter
- Callback handler to receive authorization code
- Token exchange (server-side)
- User info retrieval
- Session/cookie management
- Error handling for all OAuth errors

Show me the exact code I need to add "Sign in with BlazeNeuro" button to my app.`
}


export default function OAuthAppDetailPage() {
  const params = useParams();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/oauth/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setApp(data);
        setLoading(false);
      });
  }, [params.id]);

  const copyImplementationPrompt = () => {
    const prompt = generateImplementationPrompt(app);
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!app) {
    return <div className="p-8">App not found</div>;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeaderClient />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="max-w-4xl mx-auto w-full space-y-4">
            <div className="flex items-center gap-4">
            <Link href="/admin/oauth">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{app.name}</h1>
              <p className="text-muted-foreground">{app.description || "No description"}</p>
            </div>
            <Button
              variant="outline"
              onClick={copyImplementationPrompt}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              {copied ? "Copied!" : "Copy AI Prompt"}
            </Button>
            <Badge>Active</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client ID</CardTitle>
                <CardDescription>Use this to identify your application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={app.clientId} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(app.clientId)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Secret</CardTitle>
                <CardDescription>Keep this secret and secure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={app.clientSecret}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(app.clientSecret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Homepage URL</Label>
                <Input value={app.homepageUrl} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Authorization Callback URL</Label>
                <Input value={app.callbackUrl} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Created</Label>
                <Input value={new Date(app.createdAt).toLocaleString()} readOnly />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OAuth Endpoints</CardTitle>
              <CardDescription>Use these endpoints to integrate OAuth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Authorization URL</Label>
                <code className="block text-xs bg-muted p-3 rounded">
                  {process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"}/oauth/authorize
                </code>
              </div>

              <div className="space-y-2">
                <Label>Token URL</Label>
                <code className="block text-xs bg-muted p-3 rounded">
                  {process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"}/api/oauth/token
                </code>
              </div>

              <div className="space-y-2">
                <Label>User Info URL</Label>
                <code className="block text-xs bg-muted p-3 rounded">
                  {process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"}/api/oauth/userinfo
                </code>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
