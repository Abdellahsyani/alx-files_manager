import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import { redisClient } from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';

export default class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const { name, type, parentId, isPublic = false, data } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId) {
      const parentFile = await (await dbClient.filesCollection()).findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileDocument = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId ? ObjectId(parentId) : 0,
    };

    if (type === 'folder') {
      const newFile = await (await dbClient.filesCollection()).insertOne(fileDocument);
      return res.status(201).json({ id: newFile.insertedId, ...fileDocument });
    }

    // Handle file/image types
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const absolutePath = path.join(folderPath, `${uuidv4()}`);

    fs.mkdirSync(folderPath, { recursive: true });
    fs.writeFileSync(absolutePath, Buffer.from(data, 'base64'));

    fileDocument.localPath = absolutePath;

    const newFile = await (await dbClient.filesCollection()).insertOne(fileDocument);
    return res.status(201).json({ id: newFile.insertedId, ...fileDocument });
  }
}

module.exports = FilesController;
