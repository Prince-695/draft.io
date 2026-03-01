import { createClient } from 'redis';

const redis = createClient(
  process.env.REDIS_URL
    ? { url: process.env.REDIS_URL }
    : { socket: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379') } }
);

redis.on('error', (err) => console.error('❌ Redis error:', err));
redis.on('connect', () => console.log('✅ Redis connected'));

redis.connect().catch(console.error);

export default redis;
