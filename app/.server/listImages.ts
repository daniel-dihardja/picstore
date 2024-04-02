import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3";

export const listImages = async () => {
  const params = {
    Bucket: process.env.PICSTORE_BUCKET,
    Prefix: "output",
  };

  const data = await s3Client.send(new ListObjectsCommand(params));
  return data.Contents;
};
