const { COMFY_API_URL } = process.env;
if (!COMFY_API_URL) {
  throw new Error(`COMFY_API_URL must be set.`);
}

export const queuePrompt = async (prompt: undefined, clientId: string) => {
  try {
    const res = await fetch(`${COMFY_API_URL}/prompt`, {
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
