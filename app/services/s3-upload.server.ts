import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { UploadHandler } from "@remix-run/node";
import sharp, { Sharp } from "sharp";
import { s3Client } from "./s3.server";
declare function sharp(): Sharp;

import { env } from "./env.server";

const resizeImage = async (imgData: Buffer) => {
  return sharp(imgData).resize({ width: 512 }).toBuffer();
};

export const uploadStreamToS3 = async (
  data: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  const params: PutObjectCommandInput = {
    Bucket: env.PICSTORE_BUCKET,
    Key: key,
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

export const useS3UploaderHandler = (
  userId: string
): (({ filename, data, contentType }) => Promise<string>) => {
  return async ({ filename, data, contentType }) => {
    return await uploadStreamToS3(
      await convertToBuffer(data),
      `${userId}/input/${filename!}`,
      contentType
    );
  };
};

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
