import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/paintings-storage";

export const dynamic = "force-dynamic";

// The session cookie is httpOnly, so the client asks the server whether it is
// signed in. The mobile view uses this to decide if the artist mode is offered.
export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return NextResponse.json(
    { authed: isAuthed(cookie) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "manon2024";

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    // Set session cookie (simple: store the password itself)
    response.cookies.set("admin-session", adminPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("POST /api/admin/auth error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin-session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
