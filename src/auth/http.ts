export const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()"
};

export const ADMIN_SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()"
};

export const MAX_JSON_BODY_BYTES = 16 * 1024;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function jsonResponse(body: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...extraHeaders
    }
  });
}

export function errorResponse(status: number, code: string, message: string): Response {
  return jsonResponse(
    {
      ok: false,
      error: {
        code,
        message
      }
    },
    status
  );
}

export function methodNotAllowed(): Response {
  return errorResponse(405, "method_not_allowed", "Method not allowed.");
}

export function redirectResponse(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      ...ADMIN_SECURITY_HEADERS
    }
  });
}

export function withAdminSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(ADMIN_SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function assertSameOriginPost(request: Request): void {
  if (request.method !== "POST") {
    return;
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");

  if (origin !== requestUrl.origin) {
    throw new HttpError(403, "forbidden", "Request origin is not allowed.");
  }
}

export async function readJsonBody<T = Record<string, unknown>>(request: Request): Promise<T> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "unsupported_media_type", "Only application/json is accepted.");
  }

  const contentLength = request.headers.get("Content-Length");
  if (contentLength !== null && Number(contentLength) > MAX_JSON_BODY_BYTES) {
    throw new HttpError(413, "payload_too_large", "Request body is too large.");
  }

  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_JSON_BODY_BYTES) {
    throw new HttpError(413, "payload_too_large", "Request body is too large.");
  }

  try {
    return JSON.parse(new TextDecoder().decode(body)) as T;
  } catch {
    throw new HttpError(400, "invalid_json", "Invalid JSON body.");
  }
}

export function getStringField(body: Record<string, unknown>, field: string): string | null {
  const value = body[field];
  return typeof value === "string" ? value : null;
}

export function getClientIp(request: Request): string {
  const cfConnectingIp = request.headers.get("CF-Connecting-IP");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const forwardedFor = request.headers.get("X-Forwarded-For");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return "unknown";
}
