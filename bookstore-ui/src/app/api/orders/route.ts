import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { gatewayBaseUrl } from "@/lib/api";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    return NextResponse.json(
      { error: "Unauthorized", reason: session?.error ?? "no_session" },
      { status: 401 }
    );
  }

  const response = await fetch(`${gatewayBaseUrl}/orders/api/orders`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const responseText = await response.text();
  let responseBody: unknown = [];

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { message: responseText };
    }
  }

  return NextResponse.json(responseBody, { status: response.status });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  console.log("[orders] session check", {
    accessToken: session?.accessToken,
    expiresAt: session?.expiresAt ? new Date(session.expiresAt).toISOString() : undefined,
    error: session?.error,
    now: new Date().toISOString(),
  });

  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    return NextResponse.json(
      { error: "Unauthorized", reason: session?.error ?? "no_session" },
      { status: 401 }
    );
  }

  const payload = await request.json();
  console.log("[orders] payload received", payload);

  const response = await fetch(`${gatewayBaseUrl}/orders/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let responseBody: unknown = {};

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { message: responseText };
    }
  }

  return NextResponse.json(responseBody, { status: response.status });
}