import { MongoClient } from "mongodb";
import { env } from "./env.server";

const client = new MongoClient(env.MONGO_DB_URI);
const db = client.db();
const users = db.collection("users");

export const upsertUser = async (email: string) => {
  try {
    const res = await users.findOne({ email });
    const id = res
      ? res._id.toString()
      : (
          await users.insertOne({ email, createdAt: new Date().toISOString() })
        ).insertedId.toString();

    return { id };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { users };
