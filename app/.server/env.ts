const requiredEnvVars = [
  "PICSTORE_ACCESS_KEY",
  "PICSTORE_SECRET",
  "PICSTORE_REGION",
  "PICSTORE_BUCKET",
  "PICSTORE_URL",
  "BASETEN_API_KEY",
  "MODEL_ID",
];

const envValues = {};

requiredEnvVars.forEach((varName) => {
  const envValue = process.env[varName];
  if (!envValue) {
    throw new Error(`${varName} must be set.`);
  }
  envValues[varName] = envValue;
});

const {
  PICSTORE_ACCESS_KEY,
  PICSTORE_SECRET,
  PICSTORE_REGION,
  PICSTORE_BUCKET,
  PICSTORE_URL,
  BASETEN_API_KEY,
  MODEL_ID,
} = envValues;

export const env = {
  PICSTORE_ACCESS_KEY,
  PICSTORE_SECRET,
  PICSTORE_REGION,
  PICSTORE_BUCKET,
  PICSTORE_URL,
  BASETEN_API_KEY,
  MODEL_ID,
};
