import { LoaderFunctionArgs, json } from "@remix-run/node";
import { appCache } from "~/services/cache.server";
import { GenerateStatus } from "./create.$workflowName";

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id as string;
  return json(appCache.get<GenerateStatus>(id));
}
