import { UploadHandler } from "@remix-run/node";

const uploadStreamToComfy = async (
  data: AsyncIterable<Uint8Array>,
  key: string,
  contentType: string
) => {
  const fd = new FormData();
  fd.append("image", await convertToBlob(data), key);
  fd.append("type", "image/png");
  fd.append("overwrite", "true");

  const serverUrl = process.env.COMFYUI_SERVER_URL;
  const res = await fetch(`${serverUrl}/upload/image`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload image to ComfyUI: ${res.statusText}`);
  }

  const resJson = await res.json();
  console.log(resJson);

  return key;
};

// The UploadHandler gives us an AsyncIterable<Uint8Array>, so we need to convert that to something the aws-sdk can use.
// Here, we are going to convert that to a buffer to be consumed by the aws-sdk.
async function convertToBlob(a: AsyncIterable<Uint8Array>) {
  const result = [];
  for await (const chunk of a) {
    result.push(chunk);
  }
  return new Blob([Buffer.concat(result)]);
}

export const comfyUploaderHandler: UploadHandler = async ({
  filename,
  data,
  contentType,
}) => {
  return await uploadStreamToComfy(data, filename!, contentType);
};
