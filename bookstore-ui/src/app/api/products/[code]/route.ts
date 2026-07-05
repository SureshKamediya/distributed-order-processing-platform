import { NextResponse } from "next/server";
import { gatewayBaseUrl } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const response = await fetch(`${gatewayBaseUrl}/catalog/api/products/${encodeURIComponent(code)}`);
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
