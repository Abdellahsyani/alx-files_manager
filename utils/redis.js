import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isClientConnected = true;

    this.client.on('error', (err) => {
      console.error('Redis client failed to connect:', err.message || err.toString());
      this.isClientConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis client Connected');
      this.isClientConnected = true;
    });

    // Bind the promisified methods here
    this.getAsync = promisify(this.client.GET).bind(this.client);
    this.setexAsync = promisify(this.client.SETEX).bind(this.client);
    this.delAsync = promisify(this.client.DEL).bind(this.client);
  }

  isAlive() {
    return this.isClientConnected;
  }

  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    await this.setexAsync(key, duration, value);
  }

  async del(key) {
    await this.delAsync(key);
  }
}

export const redisClient = new RedisClient();
export default redisClient;
