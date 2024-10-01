import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import { redisClient } from '../utils/redis';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body?.email;
    const password = req.body?.password;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const existingUser = await (await dbClient.userCollection()).findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exists' });
      }

      const userCollection = await dbClient.userCollection();
      const insertInfo = await userCollection.insertOne({
        email,
        password: sha1(password), // Hash password using sha1
      });

      const userId = insertInfo.insertedId.toString();
      userQueue.add({ userId });

      return res.status(201).json({ email, id: userId });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await (await dbClient.userCollection()).findOne({ _id: ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ email: user.email, id: user._id.toString() });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UsersController;
