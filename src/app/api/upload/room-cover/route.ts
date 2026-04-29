import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { getServerAuthSession } from "~/server/auth"

export async function POST(request: Request) {
  try {
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

    // Check token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Stockage non configuré — ajoutez BLOB_READ_WRITE_TOKEN dans les variables Vercel" },
        { status: 503 }
      )
    }

    const ext = file.name.split(".").pop() ?? "jpg"
    const blob = await put(
      `room-covers/${session.user.id}-${Date.now()}.${ext}`,
      file,
      { access: "public" }
    )

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
