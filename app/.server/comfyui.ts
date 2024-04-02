import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const getPrompt = async (workflowName: string) => {
  const path = `${__dirname}/../app/workflows/${workflowName}.json`;
  const fileContent = await fs.readFile(path, "utf8");
  const wf = JSON.parse(fileContent);
  wf["3"].inputs.seed = Math.round(Math.random() * 99999);
  wf["14"].inputs.filename_prefix = "purple-bottle";
  return wf;
};

export const queuePrompt = async (
  workflowName: string,
  clientId: string,
  imageName: string,
  serverAddress: string
) => {
  try {
    const prompt = await getPrompt(workflowName);
    const res = await fetch(`${serverAddress}/prompt`, {
      method: "POST",
      body: JSON.stringify({ prompt }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data.prompt_id;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to queue prompt");
  }
};
