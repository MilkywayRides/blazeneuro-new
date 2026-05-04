"use client";

import { useEffect } from "react";

export function AnalyticsTracker({
  userId,
  name,
  email,
}: {
  userId: string;
  name?: string | null;
  email?: string | null;
}) {
  useEffect(() => {
    // This is where you would initialize your client-side tracking
    // Example: posthog.identify(userId, { name, email });
    // Example: mixpanel.identify(userId); mixpanel.people.set({ $name: name, $email: email });
    
    console.log("[Analytics] Identified user:", userId, name, email);
  }, [userId, name, email]);

  return null;
}
