import { BehaviorSubject } from "rxjs";
import { env } from "./env.server";

export type Deployment = { status: string } | undefined;

const getDeployment = async () => {
  try {
    const url = `${env.COMFY_API_PROXY_URL}/available`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Api-Key ${env.BASETEN_API_KEY}`,
      },
    });
    const data = await response.json();
    return { available: data.available };
  } catch (error) {
    console.error(error);
  }
};

const wakeDeployment = async () => {
  try {
    const url = `https://model-${env.MODEL_ID}.api.baseten.co/deployment/${env.DEPLOYMENT_ID}/wake`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${env.BASETEN_API_KEY}`,
      },
    });
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};

export const wakeupApi = async () => {
  const deployment: Deployment = await getDeployment();
  if (
    deployment?.status === "SCALED_TO_ZERO" &&
    env.ENABLE_WAKEUP_MODEL === "true"
  ) {
    await wakeDeployment();
  }
  return deployment;
};
