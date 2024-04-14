// Define the environment variables as a singleton object for type inference and runtime access
const EnvConfig = {
  PICSTORE_ACCESS_KEY: "",
  PICSTORE_SECRET: "",
  PICSTORE_REGION: "",
  PICSTORE_BUCKET: "",
  PICSTORE_URL: "",
  BASETEN_API_KEY: "",
  MODEL_ID: "",
  ENABLE_GENERATE: "",
  COMFY_PROCESSING_QUEUE: "",
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  GOOGLE_CALLBACK_URL: "",
  MONGO_DB_URI: "",
  ENABLE_WAKEUP_MODEL: "",
  DEPLOYMENT_ID: "",
} as const;

// Infer the EnvironmentVariables type from the EnvConfig object
type EnvironmentVariables = { [K in keyof typeof EnvConfig]: string };

// Dynamically generate the list of required environment variable names from the EnvConfig keys
const requiredEnvVars: Array<keyof EnvironmentVariables> = Object.keys(
  EnvConfig
) as Array<keyof EnvironmentVariables>;

// Function to validate and extract environment variables
function validateAndExtractEnvVars(
  varNames: Array<keyof EnvironmentVariables>
): EnvironmentVariables {
  const envVars: Partial<EnvironmentVariables> = {};
  varNames.forEach((varName) => {
    const envValue = process.env[varName];
    if (envValue === undefined) {
      throw new Error(`${varName} must be set.`);
    }
    envVars[varName] = envValue;
  });
  return envVars as EnvironmentVariables;
}

// Extract and validate environment variables
const env = validateAndExtractEnvVars(requiredEnvVars);

// Now `env` contains all the validated environment variables
export { env };
