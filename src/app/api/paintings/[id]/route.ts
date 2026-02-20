import { NextResponse } from "next/server";
import { getPaintings, savePaintings, isAuthed } from "@/lib/paintings-storage";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const cookie = req.headers.get("cookie") || "";
  if (!isAuthed(cookie)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const paintings = await getPaintings();
    const idx = paintings.findIndex((p) => p.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: "Tableau non trouvé" }, { status: 404 });
    }

    paintings[idx] = {
      ...paintings[idx],
      title: body.title ?? paintings[idx].title,
      medium: body.medium ?? paintings[idx].medium,
      dimensions: body.dimensions ?? paintings[idx].dimensions,
      price: body.price !== undefined ? Number(body.price) : paintings[idx].price,
      image: body.image ?? paintings[idx].image,
      year: body.year !== undefined ? Number(body.year) : paintings[idx].year,
    };

    await savePaintings(paintings);
    return NextResponse.json(paintings[idx]);
  } catch (err) {
    console.error("PUT /api/paintings/[id] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const cookie = req.headers.get("cookie") || "";
  if (!isAuthed(cookie)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const paintings = await getPaintings();
    const filtered = paintings.filter((p) => p.id !== params.id);

    if (filtered.length === paintings.length) {
      return NextResponse.json({ error: "Tableau non trouvé" }, { status: 404 });
    }

    await savePaintings(filtered);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/paintings/[id] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
