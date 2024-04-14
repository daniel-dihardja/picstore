import { LoaderFunctionArgs, json } from "@remix-run/node";
import { wakeupApi } from "~/services/wakeup-api.server";
import { appCache } from "~/services/cache.server";

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<Response> => {
  const cachedModelStatus = appCache.get("modelStatus");

  if (cachedModelStatus) {
    console.log(`from cache: ${cachedModelStatus}`);
    return json(cachedModelStatus);
  }

  const status = await wakeupApi();
  appCache.set("modelStatus", status, 5);

  console.log(`fresh: ${status}`);
  return json(status);
};
