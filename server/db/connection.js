import { MongoClient } from 'mongodb';

let db;

export async function connectDB() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db('roastmyidea');
  console.log('Connected to MongoDB: roastmyidea');
  return db;
}

export function getDB() {
  if (!db) throw new Error('Database not connected. Call connectDB first.');
  return db;
}
