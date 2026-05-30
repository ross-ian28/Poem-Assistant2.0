import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Add a favorite
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { toolHistoryId } = await req.json()

  if (!toolHistoryId) {
    return NextResponse.json({ error: "Missing toolHistoryId" }, { status: 400 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Verify the history entry belongs to this user
  const historyEntry = await prisma.toolHistory.findFirst({
    where: { id: toolHistoryId, userId: dbUser.id },
  })

  if (!historyEntry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const favorite = await prisma.favorite.upsert({
    where: { toolHistoryId },
    update: {},
    create: { userId: dbUser.id, toolHistoryId },
  })

  return NextResponse.json({ favorite })
}

// Remove a favorite
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { toolHistoryId } = await req.json()

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await prisma.favorite.deleteMany({
    where: { toolHistoryId, userId: dbUser.id },
  })

  return NextResponse.json({ success: true })
}