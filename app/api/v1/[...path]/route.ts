import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const TARGET = (
  process.env.API_PROXY_TARGET ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8081"
)
  .trim()
  .replace(/\/+$/, "");

const API_PATH = (process.env.NEXT_PUBLIC_API_PATH ?? "api/v1").replace(/^\/+|\/+$/g, "");

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const targetUrl = `${TARGET}/${API_PATH}/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "connection" || lower === "content-length") return;
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const upstream = await fetch(targetUrl, init);
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "www-authenticate") return;
    responseHeaders.set(key, value);
  });

  const body = await upstream.arrayBuffer();
  return new NextResponse(body, { status: upstream.status, headers: responseHeaders });
}

type RouteContext = { params: Promise<{ path: string[] }> | { path: string[] } };

async function resolveParams(context: RouteContext) {
  const params = await context.params;
  return params.path ?? [];
}

export async function GET(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, await resolveParams(context));
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, await resolveParams(context));
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, await resolveParams(context));
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, await resolveParams(context));
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, await resolveParams(context));
}
