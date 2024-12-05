import { MongoClient } from 'mongodb';

let db: MongoClient;

declare global {
  var __db: MongoClient | undefined;
}

async function connect() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  if (process.env.NODE_ENV === 'production') {
    db = await MongoClient.connect(process.env.MONGODB_URI);
    return db;
  }

  if (!global.__db) {
    global.__db = await MongoClient.connect(process.env.MONGODB_URI);
  }
  db = global.__db;
  return db;
}

export { connect };

export async function getDb() {
  if (!db) {
    await connect();
  }
  return db;
}

export async function closeDb() {
  if (db) {
    await db.close();
    db = undefined as any;
  }
}
