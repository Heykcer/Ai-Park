import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { signToken } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();
    } catch (dbErr) {
        console.error(`[Register DB Error] ${dbErr.message}`);
        return res.status(503).json({
            message: 'Database connection failed. Please check your internet or retry in a moment.'
        });
    }

    const { name, username, email, password } = req.body;

    try {
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (userExists) {
            const field = userExists.email === email ? 'Email' : 'Username';
            return res.status(400).json({ message: `${field} already exists` });
        }

        const user = await User.create({
            name,
            username,
            email,
            password,
        });

        const token = signToken({ id: user._id });

        // Set cookie
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(`[Register Error] ${error.message}`);
        res.status(500).json({ message: error.message });
    }
}
