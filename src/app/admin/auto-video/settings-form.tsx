"use client";

import { useState, useEffect } from "react";
import { Loader2, Settings } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateAutoVideoSettings } from "./settings-actions";

export function AutoVideoSettings({ initialData }: { initialData: any }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    instagramAccountId: initialData?.instagramAccountId || "",
    instagramAccessToken: initialData?.instagramAccessToken || "",
    geminiApiKey: initialData?.geminiApiKey || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateAutoVideoSettings(formData);
      if (result.success) {
        toast.success("Settings saved successfully");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error("Failed to save settings", {
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="size-5" />
          <CardTitle>API & Social Settings</CardTitle>
        </div>
        <CardDescription>
          Configure your Instagram and Gemini credentials.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Gemini API Key</label>
          <input
            type="password"
            placeholder="AIzaSy..."
            className="w-full p-2 border rounded-md bg-background"
            value={formData.geminiApiKey}
            onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Instagram Account ID</label>
          <input
            type="text"
            placeholder="178414..."
            className="w-full p-2 border rounded-md bg-background"
            value={formData.instagramAccountId}
            onChange={(e) => setFormData({ ...formData, instagramAccountId: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Instagram Access Token</label>
          <input
            type="password"
            placeholder="EAAG..."
            className="w-full p-2 border rounded-md bg-background"
            value={formData.instagramAccessToken}
            onChange={(e) => setFormData({ ...formData, instagramAccessToken: e.target.value })}
          />
        </div>
        <Button 
          onClick={handleSave} 
          className="w-full" 
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
