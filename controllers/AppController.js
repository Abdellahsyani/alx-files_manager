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
    Promise.all([dbClient.nbUsers(), dbClient.nbFiles()])
      .then(([usersCount, filesCount]) => {
        res.status(200).json({ users: usersCount, files: filesCount });
      });
  }
}

module.exports = AppController;
