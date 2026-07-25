export interface Env {
  ASSETS: Fetcher;
}

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders
  });
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/api/health") {
        return jsonResponse({
          ok: true,
          service: "nooha-cms-api",
          timestamp: new Date().toISOString()
        });
      }

      return env.ASSETS.fetch(request);
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "Internal Server Error"
        },
        500
      );
    }
  }
} satisfies ExportedHandler<Env>;
