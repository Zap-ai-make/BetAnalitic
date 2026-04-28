import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { getServerAuthSession } from "~/server/auth"

export async function POST(request: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "Aucun fichier" }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Format invalide (image uniquement)" }, { status: 400 })
  }

  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: "Image trop grande (max 3 Mo)" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() ?? "jpg"
  const blob = await put(
    `room-covers/${session.user.id}-${Date.now()}.${ext}`,
    file,
    { access: "public" }
  )

  return NextResponse.json({ url: blob.url })
}
