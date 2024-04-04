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

const { PICSTORE_BUCKET } = process.env;
if (!PICSTORE_BUCKET) {
  throw new Error(`PICSTORE_BUCKET must be set.`);
}

const resizeImage = async (imgData: Buffer) => {
  return sharp(imgData).resize({ width: 512 }).toBuffer();
};

const uploadStreamToS3 = async (
  data: AsyncIterable<Uint8Array>,
  key: string,
  contentType: string
): Promise<string> => {
  const params: PutObjectCommandInput = {
    Bucket: PICSTORE_BUCKET,
    Key: `input/${key}`,
    Body: await resizeImage(await convertToBuffer(data)),
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));

  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: PICSTORE_BUCKET,
      Key: key,
    }),
    { expiresIn: 60 * 60 }
  );

  console.log(url);

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
  return await uploadStreamToS3(data, filename!, contentType);
};
