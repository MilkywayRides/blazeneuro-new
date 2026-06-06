"use server"

import { db } from "@/lib/db"
import { workflow } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth-check"

export async function getWorkflows() {
  await requireAdmin()
  return await db.select().from(workflow).orderBy(workflow.createdAt)
}

export async function getWorkflowById(id: string) {
  await requireAdmin()
  const result = await db.select().from(workflow).where(eq(workflow.id, id))
  return result[0] || null
}

export async function createWorkflow(name: string, description?: string) {
  const session = await requireAdmin()
  const id = crypto.randomUUID()
  
  await db.insert(workflow).values({
    id,
    name,
    description,
    userId: session.user.id,
    nodes: [],
    edges: [],
  })

  revalidatePath("/admin/workflow")
  return id
}

export async function updateWorkflow(id: string, data: { nodes: any[], edges: any[], name?: string, description?: string }) {
  await requireAdmin()
  
  await db.update(workflow)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(workflow.id, id))

  revalidatePath(`/admin/workflow/${id}`)
  revalidatePath("/admin/workflow")
}

export async function deleteWorkflow(id: string) {
  await requireAdmin()
  await db.delete(workflow).where(eq(workflow.id, id))
  revalidatePath("/admin/workflow")
}
