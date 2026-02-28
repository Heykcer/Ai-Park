import dbConnect from '../../../lib/mongodb';
import Ticket from '../../../models/Ticket';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid token' });

    try {
        await dbConnect();
        const tickets = await Ticket.find({ user: decoded.id }).sort({ bookingDate: -1 });
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
