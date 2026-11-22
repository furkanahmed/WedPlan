const maximumImageSize = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Image uploads are not configured." },
      { status: 503 },
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "A valid multipart image upload is required." },
      { status: 400 },
    );
  }

  const image = formData.get("image");
  if (!(image instanceof File)) {
    return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!allowedImageTypes.has(image.type)) {
    return Response.json(
      { error: "Only JPEG, PNG, and WebP images are allowed." },
      { status: 400 },
    );
  }
  if (image.size > maximumImageSize) {
    return Response.json(
      { error: "Images must be 5 MB or smaller." },
      { status: 400 },
    );
  }

  const uploadData = new FormData();
  uploadData.set("image", image, image.name);

  let response;
  try {
    response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      { method: "POST", body: uploadData },
    );
  } catch {
    return Response.json(
      { error: "The image service is unavailable. Please try again." },
      { status: 502 },
    );
  }

  let result;
  try {
    result = await response.json();
  } catch {
    return Response.json(
      { error: "The image service returned an invalid response." },
      { status: 502 },
    );
  }

  if (!response.ok || result.success !== true || !result.data?.url) {
    return Response.json(
      { error: result.error?.message ?? "The image upload failed." },
      { status: 502 },
    );
  }

  return Response.json({ url: result.data.url });
}
