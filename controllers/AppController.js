const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

export default class AppController {
  static getStatus(req, res) {
    res.status(200).send({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  static getStats(req, res) {
    const stats = {
      users: 12,
      filess: 1231,
    };
    res.status(200).send(stats);
  }
}

module.exports = AppController;
