import redis from 'redis'
import { promisify } from 'util'


class RedisClient {
	constructor() {
		this.client = redis.createClient({
			host: 'localhost',
			port: 6379
		});

		this.client.on('error', (err) => {
			console.error("Redis client not connected to the server:", err);
		});
		this.client.on('ready', () => {
			console.log("Redis client connected to the server");
		});
		this.getAsync = promisify(this.client.get).bind(this.client);
		this.setAsync = promisify(this.client.set).bind(this.client);
		this.delAsync = promisify(this.client.del).bind(this.client);
	}

	isAlive() {
		return this.client.connected;
	}

	async get(key) {
		try {
			const value = await this.getAsync(key);
			return value;
		} catch (err) {
			console.error("Error getting the value from Redis", err);
		}
	}

	async set(key, value, timeout) {
		try {
        		await this.setAsync(key, value);
        		console.log(key);

        		// Set expiration time after the value is set
        		await promisify(this.client.expire).bind(this.client)(key, timeout);
		} catch (err) {
			console.error("Error setting the value in Redis", err);
		}
	}
	async del(val) {
		try {
			await this.delAsync(val);
			console.log(val);
		} catch (err) {
			console.error("Error delleting the value from redis", err);
		}
	}
}

const redisClient = new RedisClient();
export default redisClient;
