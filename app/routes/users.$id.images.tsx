import { LoaderFunctionArgs, json } from "@remix-run/node";
import { env } from "~/services/env.server";
import { listImages } from "~/services/s3-listImages.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = params.id as string;
  const files = await listImages(id);
  const images = files
    ?.filter((e) => e.Key?.includes(".png"))
    .map((e) => `${env.PICSTORE_URL}/${e.Key}`)
    .reverse()
    .slice(0, 6);

  return json({ images });
}
