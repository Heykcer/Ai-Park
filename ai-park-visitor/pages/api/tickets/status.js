import dbConnect from '../../../lib/mongodb';
import Ticket from '../../../models/Ticket';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid token' });

    try {
        await dbConnect();
        const ticket = await Ticket.findById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Ensure users can only view/cancel their own tickets
        if (ticket.user.toString() !== decoded.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { action } = req.query;
        if (action === 'cancel') {
            ticket.status = 'cancelled';
            await ticket.save();
        }

        res.status(200).json({ success: true, ticket });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
