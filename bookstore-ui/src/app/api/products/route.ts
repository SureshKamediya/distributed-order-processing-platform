import { NextResponse } from "next/server";
import { gatewayBaseUrl } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "10";

  const response = await fetch(`${gatewayBaseUrl}/catalog/api/products?page=${page}&size=${size}`);
  const responseText = await response.text();

  let responseBody: unknown = { data: [] };

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { message: responseText };
    }
  }

  return NextResponse.json(responseBody, { status: response.status });
}
