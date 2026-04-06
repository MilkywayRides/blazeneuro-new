import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Check } from "lucide-react";

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: { client_id?: string; redirect_uri?: string; scope?: string; state?: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    const returnUrl = `/oauth/authorize?${new URLSearchParams(searchParams as any).toString()}`;
    redirect(`/oauth/sign-in?callbackURL=${encodeURIComponent(returnUrl)}`);
  }

  const { client_id, redirect_uri, scope, state } = searchParams;

  if (!client_id || !redirect_uri) {
    return <div className="p-8 text-center">Invalid OAuth request</div>;
  }

  const app = await db.select().from(oauthApp).where(eq(oauthApp.clientId, client_id)).limit(1);

  if (!app[0]) {
    return <div className="p-8 text-center">Application not found</div>;
  }

  const scopes = scope?.split(" ") || ["profile", "email"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Authorize {app[0].name}</CardTitle>
          <CardDescription>
            {app[0].name} wants to access your BlazeNeuro account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium">This application will be able to:</p>
            <div className="space-y-2">
              {scopes.map((s) => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>
                    {s === "profile" && "Read your profile information"}
                    {s === "email" && "Read your email address"}
                    {s === "openid" && "Verify your identity"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Authorizing as</p>
            <p className="text-sm font-medium">{session.user.email}</p>
          </div>

          <form action="/api/oauth/authorize" method="POST" className="space-y-3">
            <input type="hidden" name="client_id" value={client_id} />
            <input type="hidden" name="redirect_uri" value={redirect_uri} />
            <input type="hidden" name="scope" value={scope} />
            <input type="hidden" name="state" value={state} />
            
            <Button type="submit" className="w-full" size="lg">
              Authorize {app[0].name}
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <a href={app[0].homepageUrl}>Cancel</a>
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            By authorizing, you allow {app[0].name} to use your information in accordance with their terms of service and privacy policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
