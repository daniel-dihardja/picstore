import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const loadWorkflow = async (workflowName: string) => {
  const path = `${__dirname}/../app/workflows/workflow_${workflowName}_api.json`;
  const fileContent = await fs.readFile(path, "utf8");
  return JSON.parse(fileContent);
};
