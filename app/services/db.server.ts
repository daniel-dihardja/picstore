import { MongoClient, ObjectId } from "mongodb";
import { env } from "./env.server";
import { Usage, UserBalance } from "~/types";

const client = new MongoClient(env.MONGO_DB_URI);
export const db = client.db();
export const getUser = async (email: string) => {
  try {
    const coll = db.collection("users");
    const res = await coll.findOne({ email });
    return res;
  } catch (error) {
    console.error(error);
  }
};

export const createUser = async ({ email, picture }) => {
  try {
    const coll = db.collection("users");
    const res = await coll.insertOne({
      email,
      picture,
      createdAt: new Date().toISOString(),
    });
    return res.insertedId.toString();
  } catch (error) {
    console.error(error);
  }
};

export const createUserUsage = async (usage: Usage) => {
  try {
    const usersUsages = db.collection("users-usages");
    await usersUsages.insertOne(usage);
  } catch (error) {
    console.error(error);
  }
};

export const getUserCredits = async (userId: string) => {
  try {
    const coll = db.collection("users-balance");
    const res = await coll
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    const credits = res.length ? res[0].totalAmount : 0;
    return Number(credits).toFixed(2);
  } catch (error) {
    console.error(error);
  }
};

export const createUserBalanceFromUsage = async (usage: Usage) => {
  try {
    const coll = db.collection("users-balance");
    const { userId } = usage;
    const lastBalance = await coll
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    const prevTotalAmount = lastBalance.length ? lastBalance[0].totalAmount : 0;

    // calculate cost
    const newAmount = -(usage.totalTime * 0.0001);
    const totalAmount = prevTotalAmount + newAmount;
    const newBalance: UserBalance = {
      userId,
      prevTotalAmount,
      newAmount,
      totalAmount,
      ref: `Cost of ${usage.serviceName}`,
      createdAt: Date.now(),
    };
    await coll.insertOne(newBalance);
  } catch (error) {
    console.error(error);
  }
};

export const createWelcomeBalance = async (userId: string) => {
  try {
    const coll = db.collection("users-balance");
    const welcomeCredits: UserBalance = {
      userId,
      prevTotalAmount: 0,
      newAmount: 100,
      totalAmount: 100,
      ref: "Welcome credits",
      createdAt: Date.now(),
    };
    const res = coll.insertOne(welcomeCredits);
    return res;
  } catch (error) {
    console.error(error);
  }
};
