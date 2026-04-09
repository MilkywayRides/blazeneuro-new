import { headers } from "next/headers";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.blazeneuro.com";

async function getSessionDebug() {
  const headersList = await headers();
  const cookie = headersList.get("cookie");
  
  if (!cookie) {
    return { error: "No cookie found", cookie: null };
  }
  
  try {
    // Try local API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://blazeneuro.com";
    const localResponse = await fetch(`${baseUrl}/api/session`, {
      headers: { 
        cookie,
        "Content-Type": "application/json"
      },
      cache: "no-store",
    });
    
    const localData = await localResponse.json();
    
    // Try direct auth URL
    const authResponse = await fetch(`${AUTH_URL}/api/auth/session`, {
      headers: { 
        cookie,
        "Content-Type": "application/json"
      },
      cache: "no-store",
    });
    
    const authData = await authResponse.json();
    
    return {
      cookie: cookie.substring(0, 100) + "...",
      localAPI: {
        status: localResponse.status,
        data: localData
      },
      authAPI: {
        status: authResponse.status,
        data: authData
      }
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      cookie: cookie.substring(0, 100) + "...",
    };
  }
}

export default async function DebugPage() {
  const sessionInfo = await getSessionDebug();
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug Info</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
        {JSON.stringify(sessionInfo, null, 2)}
      </pre>
      <div className="mt-4">
        <a href="/admin" className="text-blue-500 underline">Try Admin Page</a>
      </div>
    </div>
  );
}
