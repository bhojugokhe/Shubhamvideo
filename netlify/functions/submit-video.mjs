import { fal } from "@fal-ai/client";

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  if (!process.env.FAL_KEY) {
    return Response.json(
      { error: "FAL_KEY is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return Response.json(
        { error: "Please enter a prompt" },
        { status: 400 }
      );
    }

    fal.config({
      credentials: process.env.FAL_KEY
    });

    const result = await fal.queue.submit(
      "fal-ai/wan/v2.7/text-to-video",
      {
        input: { prompt }
      }
    );

    return Response.json({
      success: true,
      request_id: result.request_id,
      status: "IN_QUEUE"
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Video generation request failed" },
      { status: 500 }
    );
  }
};
