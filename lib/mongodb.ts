import { MongoClient, Db } from 'mongodb';

const URI = process.env.MONGODB_URI!;
const DB_NAME = 'dairy_fly';

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(URI);
  await client.connect();
  db = client.db(DB_NAME);
  return db;
}
