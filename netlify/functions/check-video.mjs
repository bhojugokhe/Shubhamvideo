import { fal } from "@fal-ai/client";

export default async (request) => {
  if (request.method !== "GET") {
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

  const requestId = new URL(request.url)
    .searchParams.get("id");

  if (!requestId) {
    return Response.json(
      { error: "Missing request ID" },
      { status: 400 }
    );
  }

  try {
    fal.config({
      credentials: process.env.FAL_KEY
    });

    const model = "fal-ai/wan/v2.7/text-to-video";

    const status = await fal.queue.status(model, {
      requestId
    });

    if (status.status === "COMPLETED") {
      const result = await fal.queue.result(model, {
        requestId
      });

      return Response.json({
        status: "COMPLETED",
        video_url: result.data?.video?.url || null
      });
    }

    return Response.json({
      status: status.status
    });

  } catch (error) {
    return Response.json(
      { error: "Unable to check video status" },
      { status: 500 }
    );
  }
};
