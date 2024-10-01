import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../utils/redis';
import dbClient from '../utils/db'; // Correctly import the MongoDB client

export default class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Info = authHeader.split(' ')[1];
    const info = Buffer.from(base64Info, 'base64').toString('utf-8');
    const [email, password] = info.split(':');

    try {
      // Retrieve user from MongoDB
      const userCollection = await dbClient.userCollection();
      const user = await userCollection.findOne({ email });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Hash the password and compare with stored hash
      const hashedPassword = createHash('sha1').update(password).digest('hex');

      if (hashedPassword !== user.password) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate the token and save in Redis
      const token = uuidv4();
      // await redisClient.set(`auth_${token}`, 24 * 60 * 60, user._id.toString());
      await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60); // Expire in 24 hours

      return res.status(200).json({ token });
    } catch (error) {
      console.error(error); // Log the error for debugging
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

module.exports = AuthController;
