import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || '';
if (!uri) throw new Error('Please define MONGODB_URI in .env');

let cachedConnection: typeof mongoose | null = null;

export async function dbConnect() {
  if (cachedConnection) return cachedConnection;

  const connection = await mongoose.connect(uri, { dbName: 'paper_db' });
  cachedConnection = connection;
  return connection;
}