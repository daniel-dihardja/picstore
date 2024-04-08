// Import environment configurations
import { env } from "./env.server";
import { loadWorkflow } from "./workflow-loader.server";

// Define a TypeScript type for workflow values as a dictionary
export type WorkflowValues = { [key: string]: string };

const createImageBuffer = (base64Img: string) => {
  const preamble = "data:image/png;base64,";
  return Buffer.from(base64Img.replace(preamble, ""), "base64");
};

/**
 * Submits a prompt configuration to the BaseTen model for processing.
 *
 * @param promptConfig - Configuration values for the prompt.
 * @returns The response data from the BaseTen model.
 */
const submitBasenet = async (promptConfig: WorkflowValues) => {
  try {
    // Make a POST request to the BaseTen model API
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

    // Parse the JSON response
    const data = await resp.json();
    return { imgBuffer: createImageBuffer(data.result[0].data) };
  } catch (error) {
    // Log any errors encountered during the fetch operation
    console.error("Failed to submit prompt to baseten: ", error);
  }
};

/**
 * Submits workflow and its values to a local proxy server.
 *
 * @param workflow - The workflow template (currently unused and undefined).
 * @param workflowValues - The configuration values for the workflow.
 * @returns A buffer containing the image data returned from the proxy.
 */
const submitToProxy = async (
  workflow: undefined,
  workflowValues: WorkflowValues
) => {
  try {
    // Make a POST request to the local proxy server
    const resp = await fetch(`http://localhost:5555/generate`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${env.BASETEN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ workflow, workflowValues }),
    });

    // Parse the JSON response
    const data = await resp.json();

    return { imgBuffer: createImageBuffer(data.base64Img) };
  } catch (error) {
    // Log any errors encountered during the fetch operation
    console.error("Failed to submit prompt to proxy: ", error);
  }
};

/**
 * Queues a prompt for processing.
 *
 * @param workflow - The workflow template (currently unused and undefined).
 * @param workflowValues - The configuration values for the workflow.
 * @returns The processed result from the proxy server.
 */
export const queuePrompt = async (
  workflowName: string,
  workflowValues: WorkflowValues
) => {
  if (env.COMFY_PROCESSING_QUEUE === "proxy") {
    const workflow = await loadWorkflow(workflowName as string);
    return await submitToProxy(workflow, workflowValues);
  } else if (env.COMFY_PROCESSING_QUEUE === "baseten") {
    return await submitBasenet(workflowValues);
  }
};
