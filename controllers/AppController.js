const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();
    res.status(200).send({ redis: redisAlive, db: dbAlive });
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
