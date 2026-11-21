export async function uploadImageToImgBB(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The image upload service returned an invalid response.");
  }

  if (!response.ok || typeof result?.url !== "string") {
    throw new Error(result?.error ?? "Image upload failed.");
  }

  return result.url;
}
