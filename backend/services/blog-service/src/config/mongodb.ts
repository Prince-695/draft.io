import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'draftio';

let mongoClient: MongoClient;
let db: Db;

export const connectMongoDB = async (): Promise<Db> => {
  try {
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    db = mongoClient.db(dbName);
    
    console.log('✅ MongoDB connected');
    
    // Create collections and indexes
    await initializeCollections();
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

const initializeCollections = async () => {
  try {
    // Create blog_content collection
    const contentCollection = db.collection('blog_content');
    await contentCollection.createIndex({ blog_id: 1 }, { unique: true });
    await contentCollection.createIndex({ author_id: 1 });
    
    // Create blog_drafts collection (for auto-save)
    const draftsCollection = db.collection('blog_drafts');
    await draftsCollection.createIndex({ blog_id: 1, author_id: 1 });
    await draftsCollection.createIndex({ updated_at: 1 });
    
    console.log('✅ MongoDB collections initialized');
  } catch (error) {
    console.error('❌ MongoDB collection initialization failed:', error);
  }
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error('MongoDB not initialized. Call connectMongoDB first.');
  }
  return db;
};

export const closeMongoDB = async () => {
  if (mongoClient) {
    await mongoClient.close();
    console.log('MongoDB connection closed');
  }
};

export default { connectMongoDB, getDB, closeMongoDB };
