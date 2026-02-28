import { verifyToken } from '../../../lib/auth';
import User from '../../../models/User';
import dbConnect from '../../../lib/mongodb';

export default async function handler(req, res) {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    await dbConnect();

    if (req.method === 'GET') {
        try {
            const user = await User.findById(decoded.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.status(200).json({ success: true, user });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else if (req.method === 'PUT') {
        try {
            const { name, email, profileImage, username } = req.body;
            const updateData = { name, email, profileImage };
            if (username) updateData.username = username;

            const user = await User.findByIdAndUpdate(
                decoded.id,
                updateData,
                { new: true, runValidators: true }
            );
            res.status(200).json({ success: true, user });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
