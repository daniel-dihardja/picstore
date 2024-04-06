import { env } from "./env";

const { COMFY_API_URL } = process.env;
if (!COMFY_API_URL) {
  throw new Error(`COMFY_API_URL must be set.`);
}

export type PromptConfig = { [key: string]: string };

const mapConfigs = (workflow: undefined, config: PromptConfig) => {
  const w = JSON.stringify(workflow);
  return w.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      return config[key];
    }
    return match; // Return the original placeholder if no matching key is found
  });
};

/**
 * Send prompt params to the baseten model endpoint
 * @param promptConfig
 */
const submitBasenet = async (promptConfig: PromptConfig) => {
  try {
    const resp = await fetch(
      `https://model-${env.MODEL_ID}.api.baseten.co/development/predict`,
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${env.BASETEN_API_KEY}`,
        },
        body: JSON.stringify({
          workflow_values: promptConfig,
        }),
      }
    );

    const data = await resp.json();
    return data;
  } catch (error) {
    console.error("Failed to submit prompt to baseten: ", error);
  }
};

export const queuePrompt = async (prompt: undefined, config: PromptConfig) => {
  //const p = mapConfigs(prompt, config);
  console.log({ config });
  return await submitBasenet(config);

  // try {
  //   const p = mapConfigs(prompt, config);
  //   const res = await fetch(`${COMFY_API_URL}/prompt`, {
  //     method: "POST",
  //     body: JSON.stringify({ prompt }),
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   const data = await res.json();
  //   return data.prompt_id;
  // } catch (err) {
  //   console.error(err);
  //   throw new Error("Failed to queue prompt");
  // }
};
