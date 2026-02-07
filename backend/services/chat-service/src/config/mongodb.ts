import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/draftio_chat';

let db: Db | null = null;
let client: MongoClient | null = null;

export const connectMongoDB = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    db = client.db();
    
    console.log('✅ Connected to MongoDB (Chat Service)');
    
    // Create indexes for better performance
    await db.collection('messages').createIndex({ conversationId: 1, createdAt: -1 });
    await db.collection('messages').createIndex({ senderId: 1 });
    await db.collection('messages').createIndex({ receiverId: 1 });
    await db.collection('conversations').createIndex({ participants: 1 });
    await db.collection('conversations').createIndex({ lastMessageAt: -1 });
    
    console.log('✅ MongoDB indexes created');
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error('Database not initialized. Call connectMongoDB() first.');
  }
  return db;
};

export const closeMongoDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('✅ MongoDB connection closed');
  }
};
