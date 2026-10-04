import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    
    // We proxy the user-agent string as it's useful for session creation
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-agent": request.headers.get("user-agent") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    // Extract the HttpOnly session cookie from FastAPI and pass it down to Next.js Client
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (error) {
    console.error("Error proxying verify-otp:", error);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}
