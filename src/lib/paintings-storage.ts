import { put, list } from "@vercel/blob";

const BLOB_PATHNAME = "manon-paintings-data.json";

export interface Painting {
  id: string;
  title: string;
  medium: string;
  dimensions: string;
  price: number;
  image: string;
  year: number;
}

export async function getPaintings(): Promise<Painting[]> {
  try {
    const { blobs } = await list({ prefix: "manon-paintings-data" });
    if (blobs.length === 0) return [];

    // Fetch the JSON blob (no-store to always get latest)
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function savePaintings(paintings: Painting[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(paintings), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

export function isAuthed(cookieHeader: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || "manon2024";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  return cookies["admin-session"] === adminPassword;
}
