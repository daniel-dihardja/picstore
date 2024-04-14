import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3.server";

export const listImages = async (userId: string) => {
  const params = {
    Bucket: process.env.PICSTORE_BUCKET,
    Prefix: `${userId}/output`,
  };

  const data = await s3Client.send(new ListObjectsCommand(params));
  return data.Contents || [];
};
