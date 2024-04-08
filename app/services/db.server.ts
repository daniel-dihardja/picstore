import { MongoClient } from "mongodb";
import { env } from "./env.server";
import { Usage } from "~/types";

const client = new MongoClient(env.MONGO_DB_URI);
const db = client.db();

export const upsertUser = async (email: string) => {
  try {
    const users = db.collection("users");
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

export const addUserUsage = async (userId: string, usage: Usage) => {
  try {
    const usersUsages = db.collection("users-usages");
    await usersUsages.insertOne({ ...usage, userId });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
