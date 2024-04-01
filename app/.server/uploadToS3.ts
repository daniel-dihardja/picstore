import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { UploadHandler } from "@remix-run/node";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const {
  PICSTORE_ACCESS_KEY,
  PICSTORE_SECRET,
  PICSTORE_REGION,
  PICSTORE_BUCKET,
  PICSTORE_URL,
} = process.env;

if (!PICSTORE_ACCESS_KEY) {
  throw new Error(`PICSTORE_ACCESS_KEY must be set.`);
}

if (!PICSTORE_SECRET) {
  throw new Error(`PICSTORE_SECRET must be set.`);
}

if (!PICSTORE_REGION) {
  throw new Error(`PICSTORE_REGION must be set.`);
}

if (!PICSTORE_BUCKET) {
  throw new Error(`PICSTORE_BUCKET must be set.`);
}

if (!PICSTORE_URL) {
  throw new Error(`Bucket url must be set.`);
}

const s3Client = new S3Client({
  region: PICSTORE_REGION,
  credentials: {
    accessKeyId: PICSTORE_ACCESS_KEY,
    secretAccessKey: PICSTORE_SECRET,
  },
});

const uploadStreamToS3 = async (
  data: AsyncIterable<Uint8Array>,
  key: string,
  contentType: string
) => {
  const params: PutObjectCommandInput = {
    Bucket: PICSTORE_BUCKET,
    Key: key,
    Body: await convertToBuffer(data),
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
