import { MongoClient } from "mongodb";

const collections = ["users", "users-usages", "users-balance"];

const run = async () => {
  try {
    const client = new MongoClient(process.env.MONGO_DB_URI);
    const db = client.db();
    collections.forEach(async (collection) => {
      console.log(`Clearing collection: ${collection}`);
      await db.collection(collection).deleteMany({});
    });
  } catch (error) {
    console.error(error);
  }
};

run();
