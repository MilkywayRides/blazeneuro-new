"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateOAuthPermissions, revokeOAuthAccess } from "@/app/admin/settings/oauth/actions";

type OAuthApp = {
  id: string;
  name: string;
  clientId: string;
  homepageUrl: string;
  description: string | null;
};

type OAuthToken = {
  id: string;
  scope: string;
};

const PERMISSION_GROUPS = {
  basic: {
    label: "Basic Information",
    description: "Always shared with authorized apps",
    permissions: [
      { id: "email", label: "Email address" },
      { id: "name", label: "Name" },
      { id: "avatar", label: "Profile picture" },
    ],
    locked: true,
  },
  profile: {
    label: "Full Profile Data",
    description: "Extended user information",
    permissions: [
      { id: "phone", label: "Phone number" },
      { id: "subscription", label: "Subscription status" },
      { id: "created_at", label: "Account creation date" },
    ],
    locked: false,
  },
};

export function OAuthPermissionCard({ app, token }: { app: OAuthApp; token: OAuthToken }) {
  const [scopes, setScopes] = useState<string[]>(token.scope.split(" "));
  const [loading, setLoading] = useState(false);

  const hasScope = (scope: string) => scopes.includes(scope);

  const toggleScope = (scope: string) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    await updateOAuthPermissions(token.id, scopes.join(" "));
    setLoading(false);
  };

  const handleRevoke = async () => {
    if (confirm(`Revoke access for ${app.name}?`)) {
      setLoading(true);
      await revokeOAuthAccess(token.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{app.name}</CardTitle>
            <CardDescription>{app.description || app.homepageUrl}</CardDescription>
          </div>
          <Badge variant="secondary">
            <code className="text-xs">{app.clientId}</code>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(PERMISSION_GROUPS).map(([key, group]) => (
          <div key={key} className="space-y-3">
            <div>
              <h4 className="font-medium">{group.label}</h4>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </div>
            <div className="space-y-2 pl-4">
              {group.permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${app.id}-${permission.id}`}
                    checked={group.locked || hasScope(permission.id)}
                    disabled={group.locked || loading}
                    onCheckedChange={() => !group.locked && toggleScope(permission.id)}
                  />
                  <Label
                    htmlFor={`${app.id}-${permission.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} disabled={loading}>
            Save Changes
          </Button>
          <Button variant="destructive" onClick={handleRevoke} disabled={loading}>
            Revoke Access
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
