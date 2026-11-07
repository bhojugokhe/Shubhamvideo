import { get } from "@netlify/blobs";

export default async function handler(req, context) {
  return new Response(
    JSON.stringify({ status: "Backend setup pending" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}
