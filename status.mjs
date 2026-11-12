export default async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Only POST requests are allowed." }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const apiKey = process.env.FAL_KEY;
    const modelId = process.env.FAL_MODEL_ID;

    if (!apiKey || !modelId) {
      return new Response(
        JSON.stringify({
          error: "FAL_KEY or FAL_MODEL_ID is not configured."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const body = await req.json();
    const requestId = body.request_id;

    if (!requestId || typeof requestId !== "string") {
      return new Response(
        JSON.stringify({ error: "A valid request_id is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const url =
      `https://queue.fal.run/${modelId}/requests/${encodeURIComponent(requestId)}/status`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Key ${apiKey}`
      }
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Unable to check video status." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
