import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, painting } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Proxy the request to the home server relay via ngrok tunnel
    const relayResponse = await fetch("https://overtruly-periastral-gidget.ngrok-free.dev/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Contact-Key": "manon-contact-2024",
      },
      body: JSON.stringify({ name, email, phone, message, painting }),
    });

    const result = await relayResponse.json();

    if (!relayResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send email via relay",
        },
        { status: relayResponse.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    );
  }
}
