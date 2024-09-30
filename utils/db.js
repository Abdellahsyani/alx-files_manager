import mongodb from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';
    const dbURL = `mongodb://${host}:${port}/${database}`;

    this.client = new mongodb.MongoClient(dbURL, { useUnifiedTopology: true });
    this.connected = false;
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.client = null;
    }
  }

  isAlive() {
    return (
      this.connected
      && this.client
      && this.client.topology
      && this.client.topology.isConnected()
    );
  }

  async userCollection() {
    if (!this.isAlive()) {
      throw new Error('Not connected to the database');
    }
    return this.client.db().collection('users');
  }

  async nbUsers() {
    if (!this.isAlive()) {
      throw new Error('Not connected to the database');
    }
    try {
      return await this.client.db().collection('users').countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      throw error;
    }
  }

  async nbFiles() {
    if (!this.isAlive()) {
      throw new Error('Not connected to the database');
    }
    try {
      return await this.client.db().collection('files').countDocuments();
    } catch (error) {
      console.error('Error counting files:', error);
      throw error;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
