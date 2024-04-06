import {
  PutObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { UploadHandler } from "@remix-run/node";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./s3";
import sharp, { Sharp } from "sharp";
declare function sharp(): Sharp;

import { env } from "./env";

const resizeImage = async (imgData: Buffer) => {
  return sharp(imgData).resize({ width: 512 }).toBuffer();
};

export const uploadStreamToS3 = async (
  data: Buffer,
  key: string,
  contentType: string,
  folder = "input"
): Promise<string> => {
  const params: PutObjectCommandInput = {
    Bucket: env.PICSTORE_BUCKET,
    Key: `${folder}/${key}`,
    Body: await resizeImage(data),
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));

  return key;
};

// The UploadHandler gives us an AsyncIterable<Uint8Array>, so we need to convert that to something the aws-sdk can use.
// Here, we are going to convert that to a buffer to be consumed by the aws-sdk.
async function convertToBuffer(a: AsyncIterable<Uint8Array>) {
  const result = [];
  for await (const chunk of a) {
    result.push(chunk);
  }
  return Buffer.concat(result);
}

export const s3UploaderHandler: UploadHandler = async ({
  filename,
  data,
  contentType,
}) => {
  return await uploadStreamToS3(
    await convertToBuffer(data),
    filename!,
    contentType
  );
};
