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
    const duration = Number(body.duration || 5);
    const aspectRatio = body.aspect_ratio || "16:9";

    if (!prompt || prompt.length > 5000) {
      return Response.json(
        { error: "Please enter a valid prompt (max 5000 characters)" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(duration) || duration < 2 || duration > 15) {
      return Response.json(
        { error: "Duration must be between 2 and 15 seconds" },
        { status: 400 }
      );
    }

    const allowedRatios = ["16:9", "9:16", "1:1", "4:3", "3:4"];

    if (!allowedRatios.includes(aspectRatio)) {
      return Response.json(
        { error: "Invalid aspect ratio" },
        { status: 400 }
      );
    }

    fal.config({
      credentials: process.env.FAL_KEY
    });

    const result = await fal.queue.submit(
      "fal-ai/wan/v2.7/text-to-video",
      {
        input: {
          prompt,
          duration,
          aspect_ratio: aspectRatio
        }
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
