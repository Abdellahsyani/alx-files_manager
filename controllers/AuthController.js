import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../utils/redis';

const users = [
  { email: 'test@example.com', passwordHash: createHash('sha1').update('password123').digest('hex'), _id: '1' },
];

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
      const user = users.find((u) => u.email === email);
      const hashedPassword = createHash('shal').update(password).digest('hex');
      if (!user || hashedPassword !== user.passwordHash) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 'EX', 24 * 60 * 60);

      return res.status(200).json({ token });
    } catch (error) {
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
