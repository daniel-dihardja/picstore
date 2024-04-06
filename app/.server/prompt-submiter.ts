// Import environment configurations
import { env } from "./env";

// Define a TypeScript type for workflow values as a dictionary
export type WorkflowValues = { [key: string]: string };

/**
 * Replaces placeholders in a workflow template with actual configuration values.
 *
 * @param workflow - The template containing placeholders for replacement.
 * @param config - The actual values to replace the placeholders.
 * @returns A parsed workflow with all placeholders replaced by actual values.
 */
const mapConfigs = (workflow: undefined, config: WorkflowValues) => {
  // Convert the workflow template to a string
  const w = JSON.stringify(workflow);

  // Replace each placeholder with the actual value from the config, if available
  return JSON.parse(
    w.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      // Check if the placeholder matches a key in the config
      if (Object.prototype.hasOwnProperty.call(config, key)) {
        return config[key]; // Replace with the actual value
      }
      return match; // Return the original placeholder if no matching key is found
    })
  );
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
    return data;
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

    // Decode the base64 image data to a buffer
    const preamble = "data:image/png;base64,";
    const imgBuffer = Buffer.from(
      data.base64Img.replace(preamble, ""),
      "base64"
    );

    return { imgBuffer };
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
  workflow: undefined,
  workflowValues: WorkflowValues
) => {
  // Currently, this function simply forwards the call to submitToProxy.
  // It's set up for potential extension or alternate branching logic in the future.
  return await submitToProxy(workflow, workflowValues);
  // Uncomment the following line to switch to submitting directly to BaseTen instead.
  // return await submitBasenet(config);
};
