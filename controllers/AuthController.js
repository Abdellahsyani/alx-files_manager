import shal from 'shal';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Info = authHeader.split(' ')[1];
    const info = Buffer.from(base64Info, 'base64').toString('utf-8');
    const [email, password] = info.split(':');

    try {
        const user = await User.findUser({ email });
        if (!user || shal(password) !== user.passwordHash) {
            return res.status(401).json({ error: 'Unauthorized' }); 
        }

        const token = uuidv4();
        await redisClient.set(`auth_${token}`, user._id.toString(), 'EX',24 * 60 * 60);

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error'});
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);
    res.status(204).send();
  }
}

module.exports = AuthController;