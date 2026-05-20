const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function normalizeRequestBody(body) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (Buffer.isBuffer(body) || typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

export default async function handler(request, response) {
  const backendApiBaseUrl = String(process.env.BACKEND_API_BASE_URL || "").trim().replace(/\/$/, "");

  if (!backendApiBaseUrl) {
    response.status(500).json({
      message: "BACKEND_API_BASE_URL is not configured. Add it in your Vercel project environment variables.",
    });
    return;
  }

  const incomingUrl = new URL(request.url, `https://${request.headers.host}`);
  const upstreamPath = incomingUrl.pathname.replace(/^\/api\/?/, "");
  const upstreamUrl = `${backendApiBaseUrl}${upstreamPath ? `/${upstreamPath}` : ""}${incomingUrl.search}`;

  const upstreamHeaders = {};

  ["accept", "authorization", "content-type", "user-agent"].forEach((headerName) => {
    const value = request.headers[headerName];

    if (typeof value === "string" && value.trim() !== "") {
      upstreamHeaders[headerName] = value;
    }
  });

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: upstreamHeaders,
      body: ["GET", "HEAD"].includes(String(request.method || "").toUpperCase())
        ? undefined
        : normalizeRequestBody(request.body),
      redirect: "manual",
    });

    upstreamResponse.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        response.setHeader(key, value);
      }
    });

    response.status(upstreamResponse.status).send(Buffer.from(await upstreamResponse.arrayBuffer()));
  } catch {
    response.status(502).json({
      message: `Unable to reach backend API at ${backendApiBaseUrl}.`,
    });
  }
}
