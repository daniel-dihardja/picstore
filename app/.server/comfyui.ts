import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const queuePrompt = async (
  workflowPath: string,
  clientId: string,
  serverAddress: string
) => {
  try {
    const path = __dirname + "/../app/workflows/default.json";
    const fileContent = await fs.readFile(path, "utf8");
    console.log(fileContent);
    const prompt = JSON.parse(fileContent);

    const res = await fetch(`${serverAddress}/prompt`, {
      method: "POST",
      body: JSON.stringify({ prompt: prompt }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(res);
    return res;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to queue prompt");
  }
};
