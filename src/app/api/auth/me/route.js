import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        // Forward the session cookie so the backend knows who we are
        "cookie": request.headers.get("cookie") || "",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error proxying me:", error);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}
