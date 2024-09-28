import {createClient } from 'redis'
import { promisify } from 'util'


class RedisClient {
	constructor() {
		this.client = createClient();
		this.isClientConnected = true;

		this.client.on('error', (err) => {
			console.error("Redis client not connected to the server:", err.message || err.toString());
			this.isClientConnected = false;
		});
		this.client.on('ready', () => {
			this.isClientConnected = true
		});
	}

	isAlive() {
		return this.isClientConnected;
	}

	async get(key) {
		return promisify(this.client.GET).bind(this.client)(key);
	}

	async set(key, value, timeout) {
		await promisify(this.client.SETEX)
		  .bind(this.client)(key, value, timeout);
	}
	async del(val) {
		await promisify(this.client.DEL).bind(this.client)(key);
	}
}

export const redisClient = new RedisClient();
export default redisClient;
