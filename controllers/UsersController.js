import shal from 'sha1';
import dbClient from '../utils/db';

export default class UsersController {
    static async postNew(req, res) {
        const email = req.body ? req.body.email : null;
        const password = req.body ? req.body.password: null;

        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }
        if (!password) {
            return res.status(400).json({ error:  'Missing password' });
        }
        const existingUser = await (await dbClient.userCollection()).findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Already exist' });
        }
        const insertInfo = await (await dbClient.userCollection()).insertOne({ email, password: shal(password) });

        const newUser = new User({ email, password: InsertInfo });
        await newUser.save();
        res.status(201).json({ email, id: newUser });
    }
}
