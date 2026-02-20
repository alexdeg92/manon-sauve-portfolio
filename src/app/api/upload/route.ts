import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/paintings-storage";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  if (!isAuthed(cookie)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Sanitize filename, store in a subfolder
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filename = `paintings/${Date.now()}-${cleanName}`;

    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("POST /api/upload error:", err);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
