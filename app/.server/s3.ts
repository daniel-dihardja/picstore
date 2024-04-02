import { S3Client } from "@aws-sdk/client-s3";

export const {
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

export const s3Client = new S3Client({
  region: PICSTORE_REGION,
  credentials: {
    accessKeyId: PICSTORE_ACCESS_KEY,
    secretAccessKey: PICSTORE_SECRET,
  },
});
