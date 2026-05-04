import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-check";
import { db } from "@/lib/db";
import { oauthApp } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authorize Application",
};

export default async function OAuthAuthorizePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await requireAuth();
  const params = await searchParams;

  const clientId = typeof params.client_id === "string" ? params.client_id : "";
  const redirectUri = typeof params.redirect_uri === "string" ? params.redirect_uri : "";
  const scope = typeof params.scope === "string" ? params.scope : "profile email";
  const state = typeof params.state === "string" ? params.state : "";
  const responseType = typeof params.response_type === "string" ? params.response_type : "code";

  if (!clientId || !redirectUri) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>Missing client_id or redirect_uri parameters.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const appResult = await db.select().from(oauthApp).where(eq(oauthApp.clientId, clientId)).limit(1);
  const app = appResult[0];

  if (!app) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Application Not Found</CardTitle>
            <CardDescription>The application requesting access is invalid or has been deleted.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const scopesRequested = scope.split(" ").filter(Boolean);

  // Construct cancel URL
  const cancelUrl = new URL(redirectUri);
  cancelUrl.searchParams.set("error", "access_denied");
  if (state) cancelUrl.searchParams.set("state", state);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/50 p-4">
      <Card className="max-w-md w-full border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Authorize {app.name}</CardTitle>
          <CardDescription className="text-base mt-2">
            <span className="font-semibold text-foreground">{app.name}</span> wants to access your BlazeNeuro account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-background" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="text-sm">
                <p className="font-medium text-foreground leading-none">{session.user.name}</p>
                <p className="text-muted-foreground mt-1">{session.user.email}</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground pt-3 border-t border-border/50">
              <p className="font-medium text-foreground mb-2">This will allow {app.name} to:</p>
              <ul className="space-y-2">
                {scopesRequested.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>Access your <span className="font-medium text-foreground">{s}</span> information</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center px-4">
            By clicking Continue, you allow this app to use your information in accordance with their <Link href={app.homepageUrl} className="underline hover:text-primary" target="_blank">terms of service</Link>.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
          <Link href={cancelUrl.toString()} className="w-full sm:w-1/2">
            <Button variant="outline" type="button" className="w-full">
              Cancel
            </Button>
          </Link>
          <form action="/api/oauth/v1/authorize" method="POST" className="w-full sm:w-1/2">
            <input type="hidden" name="client_id" value={clientId} />
            <input type="hidden" name="redirect_uri" value={redirectUri} />
            <input type="hidden" name="scope" value={scope} />
            <input type="hidden" name="state" value={state} />
            <input type="hidden" name="response_type" value={responseType} />
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground shadow-md transition-all hover:shadow-lg">
              Continue
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
