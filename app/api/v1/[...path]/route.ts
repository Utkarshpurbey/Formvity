import { NextRequest, NextResponse } from "next/server";

const API_TARGET = (
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8081"
).replace(/\/+$/, "");

const API_PREFIX = "/api/v1";

const STRIP_RESPONSE_HEADERS = new Set([
  "www-authenticate",
  "transfer-encoding",
  "connection",
  "keep-alive",
]);

function buildBackendUrl(pathSegments: string[], search: string): string {
  const path = pathSegments.join("/");
  return `${API_TARGET}${API_PREFIX}/${path}${search}`;
}

async function proxy(
  request: NextRequest,
  context: { params: { path: string[] } },
): Promise<NextResponse> {
  const backendUrl = buildBackendUrl(context.params.path, request.nextUrl.search);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "connection" || lower === "content-length") return;
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(backendUrl, init);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Backend unreachable";
    return NextResponse.json({ message }, { status: 502 });
  }

  const outHeaders = new Headers();
  backendRes.headers.forEach((value, key) => {
    if (STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) return;
    outHeaders.append(key, value);
  });

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: outHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
