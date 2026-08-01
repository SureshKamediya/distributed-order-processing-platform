import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { gatewayBaseUrl } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    return NextResponse.json(
      { error: "Unauthorized", reason: session?.error ?? "no_session" },
      { status: 401 }
    );

  }

  const { orderNumber } = await params;

  const response = await fetch(`${gatewayBaseUrl}/orders/api/orders/${encodeURIComponent(orderNumber)}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
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
