import shal from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';
import { redisClient } from '../utils/redis';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const existingUser = await (await dbClient.userCollection()).findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }
    const userCollection = await dbClient.userCollection();
    const insertInfo = await userCollection.insertOne({
      email,
      password: shal(password),
    });
    const userId = insertInfo.insertedId.toString();

    userQueue.add({ userId });
    return res.status(201).json({ email, id: userId });
  }

  static async getMe(req, res) {
    const token = req.headers['X-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await (await dbClient.userCollection()).findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}

module.exports = UsersController;
