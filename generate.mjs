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

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "FAL_KEY is missing in Netlify environment variables."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid video prompt." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Model ID must be configured after selecting a supported FAL model.
    const modelId = process.env.FAL_MODEL_ID;

    if (!modelId) {
      return new Response(
        JSON.stringify({
          error: "FAL_MODEL_ID is not configured yet. No generation request was sent."
        }),
        {
          status: 501,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const response = await fetch(
      `https://queue.fal.run/${modelId}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: prompt.trim() })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: result.detail || result.error || "FAL request failed."
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error while submitting the request." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
