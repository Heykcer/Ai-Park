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
        console.error(`[Login DB Error] ${dbErr.message}`);
        return res.status(503).json({
            message: 'Database connection failed. Please check your internet or retry in a moment.'
        });
    }

    // 'identifier' can be either email or username
    const { identifier, email, password } = req.body;
    const loginValue = identifier || email;

    if (!loginValue || !password) {
        return res.status(400).json({ message: 'Please provide credentials' });
    }

    try {
        // Search by email OR username
        const user = await User.findOne({
            $or: [
                { email: loginValue.toLowerCase() },
                { username: loginValue }
            ]
        }).select('+password');

        if (!user) {
            console.log(`[Login Debug] User not found: ${loginValue}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log(`[Login Debug] Password mismatch for: ${loginValue}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = signToken({ id: user._id });

        // Set cookie
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            },
        });
    } catch (error) {
        console.error(`[Login Runtime Error] ${error.message}`);
        res.status(500).json({ message: 'An internal server error occurred. Please try again later.' });
    }
}
