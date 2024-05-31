import {
  ActionFunctionArgs,
  json,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { useS3UploaderHandler } from "~/services/s3-upload.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = params.id as string;

  const formData = await unstable_parseMultipartFormData(
    request,
    useS3UploaderHandler(userId)
  );
  const image = formData.get("file")?.toString();
  return json({ image });
}
