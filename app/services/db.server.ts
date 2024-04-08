import { MongoClient } from "mongodb";
import { env } from "./env.server";

const client = new MongoClient(env.MONGO_DB_URI);
const db = client.db();

export { db };
