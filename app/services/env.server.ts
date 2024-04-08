const requiredEnvVars = [
  "PICSTORE_ACCESS_KEY",
  "PICSTORE_SECRET",
  "PICSTORE_REGION",
  "PICSTORE_BUCKET",
  "PICSTORE_URL",
  "BASETEN_API_KEY",
  "MODEL_ID",
  "ENABLE_GENERATE",
  "COMFY_PROCESSING_QUEUE",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
  "MONGO_DB_URI",
];

// Function to validate and extract environment variables
function validateAndExtractEnvVars(varNames) {
  const envVars = {};
  varNames.forEach((varName) => {
    const envValue = process.env[varName];
    if (envValue === undefined) {
      throw new Error(`${varName} must be set.`);
    }
    envVars[varName] = envValue;
  });
  return envVars;
}

// Extract and validate environment variables
const env = validateAndExtractEnvVars(requiredEnvVars);

// Now `env` contains all the validated environment variables
export { env };
