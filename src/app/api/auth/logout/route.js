import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "cookie": request.headers.get("cookie") || "",
      },
    });

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    // The backend should send a Set-Cookie to clear the session cookie, we forward it.
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (error) {
    console.error("Error proxying logout:", error);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}
