import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.server";

export const s3Client = new S3Client({
  region: env.PICSTORE_REGION,
  credentials: {
    accessKeyId: env.PICSTORE_ACCESS_KEY,
    secretAccessKey: env.PICSTORE_SECRET,
  },
});
