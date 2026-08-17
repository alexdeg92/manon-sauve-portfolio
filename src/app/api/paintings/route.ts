import { NextResponse } from "next/server";
import { getPaintings, savePaintings, isAuthed, Painting } from "@/lib/paintings-storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const paintings = await getPaintings();
    return NextResponse.json(paintings, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    console.error("GET /api/paintings error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  if (!isAuthed(cookie)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const paintings = await getPaintings();

    const newPainting: Painting = {
      id: body.id || `painting-${Date.now()}`,
      title: body.title,
      medium: body.medium,
      dimensions: body.dimensions,
      price: body.price === null || body.price === "" ? null : Number(body.price),
      image: body.image,
      year: Number(body.year),
      sold: Boolean(body.sold),
      collection: body.collection || null,
      note: body.note || null,
    };

    paintings.unshift(newPainting);
    await savePaintings(paintings);

    return NextResponse.json(newPainting);
  } catch (err) {
    console.error("POST /api/paintings error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
