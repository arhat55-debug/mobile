// Supabase Edge Function: delete-cloudinary-image
//
// Deletes one or more images from Cloudinary by public_id.
// The Cloudinary API secret never reaches the browser — it only
// lives here, as an Edge Function secret.
//
// Deploy:
//   supabase functions deploy delete-cloudinary-image
//
// Required secrets (set once):
//   supabase secrets set CLOUDINARY_CLOUD_NAME=your-cloud
//   supabase secrets set CLOUDINARY_API_KEY=your-key
//   supabase secrets set CLOUDINARY_API_SECRET=your-secret
//
// Request body: { "urls": ["https://res.cloudinary.com/.../upload/v123/folder/abc.jpg", ...] }
// or:           { "publicIds": ["folder/abc", ...] }

import { createHash } from "node:crypto";

const CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME") ?? "";
const API_KEY = Deno.env.get("CLOUDINARY_API_KEY") ?? "";
const API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function extractPublicId(url: string): string | null {
  // Matches: .../upload/(v12345/)?folder/name.ext  ->  folder/name
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

function sha1(input: string): string {
  return createHash("sha1").update(input).digest("hex");
}

async function destroyAsset(publicId: string): Promise<{ publicId: string; result: string }> {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
  const signature = sha1(paramsToSign);

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("timestamp", String(timestamp));
  form.append("api_key", API_KEY);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    { method: "POST", body: form },
  );
  const json = await res.json();
  return { publicId, result: json.result ?? "unknown" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return new Response(
      JSON.stringify({ error: "Cloudinary secrets not configured on the server." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body = await req.json();
    const urls: string[] = Array.isArray(body.urls) ? body.urls : [];
    const explicitIds: string[] = Array.isArray(body.publicIds) ? body.publicIds : [];

    const fromUrls = urls
      .map((u) => extractPublicId(u))
      .filter((id): id is string => Boolean(id));

    const publicIds = [...new Set([...fromUrls, ...explicitIds])];

    if (publicIds.length === 0) {
      return new Response(JSON.stringify({ deleted: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.all(publicIds.map(destroyAsset));

    return new Response(JSON.stringify({ deleted: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

