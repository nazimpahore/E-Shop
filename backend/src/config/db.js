import mongoose from 'mongoose';

const DEFAULT_DIRECT_URI =
  'mongodb://nazimpahore80_db_user:XT2xR7Y7WoMY5LK1@ac-bacoewd-shard-00-00.ic7a3l6.mongodb.net:27017,ac-bacoewd-shard-00-01.ic7a3l6.mongodb.net:27017,ac-bacoewd-shard-00-02.ic7a3l6.mongodb.net:27017/E-Shop?ssl=true&replicaSet=atlas-n6pxnw-shard-0&authSource=admin&retryWrites=true&w=majority';

/**
 * Connect to MongoDB with resilient fallback for Windows SRV DNS resolution (EBADRESP)
 */
let cachedPromise = null;
export let lastConnectionError = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  let uri = process.env.MONGODB_URI || DEFAULT_DIRECT_URI;

  try {
    cachedPromise = mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 8000
    });

    const conn = await cachedPromise;
    lastConnectionError = null;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    cachedPromise = null;
    lastConnectionError = error.message;

    // Windows c-ares DNS UDP packet truncation fix for mongodb+srv
    if (error.message.includes('querySrv') || error.message.includes('EBADRESP')) {
      console.warn('[Database] Windows SRV DNS lookup failed (EBADRESP). Retrying with direct cluster replicaSet nodes...');
      try {
        cachedPromise = mongoose.connect(DEFAULT_DIRECT_URI, {
          autoIndex: process.env.NODE_ENV !== 'production',
          serverSelectionTimeoutMS: 8000
        });
        const conn = await cachedPromise;
        console.log(`[Database] MongoDB Connected via direct ReplicaSet: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      } catch (fallbackErr) {
        cachedPromise = null;
        console.error(`[Database Error] Fallback connection also failed: ${fallbackErr.message}`);
      }
    }

    console.error(`[Database Error] Connection failed: ${error.message}`);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database Error]', err.message);
});
