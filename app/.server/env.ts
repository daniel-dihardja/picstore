export const {
  PICSTORE_ACCESS_KEY,
  PICSTORE_SECRET,
  PICSTORE_REGION,
  PICSTORE_BUCKET,
  PICSTORE_URL,
  BASETEN_API_KEY,
  MODEL_ID,
} = process.env;

if (!PICSTORE_ACCESS_KEY) {
  throw new Error(`PICSTORE_ACCESS_KEY must be set.`);
}

if (!PICSTORE_SECRET) {
  throw new Error(`PICSTORE_SECRET must be set.`);
}

if (!PICSTORE_REGION) {
  throw new Error(`PICSTORE_REGION must be set.`);
}

if (!PICSTORE_BUCKET) {
  throw new Error(`PICSTORE_BUCKET must be set.`);
}

if (!PICSTORE_URL) {
  throw new Error(`PICSTORE_URL url must be set.`);
}

if (!BASETEN_API_KEY) {
  throw new Error(`BASETEN_API_KEY must be set.`);
}
if (!MODEL_ID) {
  throw new Error(`MODEL_ID api key must be set.`);
}

export const env = {
  PICSTORE_ACCESS_KEY,
  PICSTORE_SECRET,
  PICSTORE_REGION,
  PICSTORE_BUCKET,
  PICSTORE_URL,
};
