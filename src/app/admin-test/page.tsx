import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

export default async function AdminTestPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  let dbUser = null;
  if (session?.user) {
    const result = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
    dbUser = result[0];
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Debug Page</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Session:</h2>
          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(session, null, 2)}</pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">DB User:</h2>
          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(dbUser, null, 2)}</pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">Role Check:</h2>
          <p>Role: {dbUser?.role || "No role"}</p>
          <p>Is Admin: {(dbUser?.role === "admin" || dbUser?.role === "superAdmin") ? "YES" : "NO"}</p>
        </div>
      </div>
    </div>
  );
}
