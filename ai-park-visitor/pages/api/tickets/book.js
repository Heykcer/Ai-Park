import dbConnect from '../../../lib/mongodb';
import Ticket from '../../../models/Ticket';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid token' });

    try {
        await dbConnect();
        const { visitors, visitDate, totalPrice } = req.body;

        if (!visitors || !Array.isArray(visitors) || visitors.length === 0) {
            return res.status(400).json({ message: 'At least one visitor is required' });
        }

        const ticket = await Ticket.create({
            user: decoded.id,
            visitors,
            visitDate,
            totalPrice,
        });

        res.status(201).json({ success: true, ticket });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
