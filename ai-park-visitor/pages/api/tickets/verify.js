import dbConnect from '../../../lib/mongodb';
import Ticket from '../../../models/Ticket';
import { createHmac } from 'crypto';

const QR_SECRET = process.env.QR_SECRET || 'sunnysplash-qr-secret-2025';

/**
 * POST /api/tickets/verify
 * Body: { qrToken: "<base64 encoded qr token>" }
 *
 * Returns: { valid: true, ticket: {...} } or { valid: false, reason: "..." }
 * Used by admin / gate scanners to verify a visitor's QR code.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { qrToken } = req.body;
    if (!qrToken) {
        return res.status(400).json({ valid: false, reason: 'Missing qrToken' });
    }

    try {
        // 1. Decode the base64 token
        let decoded;
        try {
            decoded = JSON.parse(Buffer.from(qrToken, 'base64').toString('utf-8'));
        } catch {
            return res.status(400).json({ valid: false, reason: 'Invalid QR token format' });
        }

        const { payload, sig } = decoded;
        if (!payload || !sig) {
            return res.status(400).json({ valid: false, reason: 'Malformed QR token' });
        }

        // 2. Re-compute HMAC and compare signatures to detect forgery
        const expectedSig = createHmac('sha256', QR_SECRET)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (expectedSig !== sig) {
            return res.status(200).json({ valid: false, reason: 'Invalid signature — QR code has been tampered with' });
        }

        // 3. Look up the ticket in MongoDB to get current status
        await dbConnect();
        const ticket = await Ticket.findById(payload.ticketId).lean();

        if (!ticket) {
            return res.status(200).json({ valid: false, reason: 'Ticket not found in database' });
        }

        if (ticket.status === 'cancelled') {
            return res.status(200).json({ valid: false, reason: 'This ticket has been cancelled', ticket });
        }

        if (ticket.status === 'completed') {
            return res.status(200).json({ valid: false, reason: 'This ticket has already been used for entry', ticket });
        }

        // 4. Ticket is valid — return confirmation with ticket details
        return res.status(200).json({
            valid: true,
            message: '✅ Ticket verified successfully. Entry granted!',
            ticket: {
                ref: payload.ref,
                ticketId: payload.ticketId,
                visitDate: payload.visitDate,
                visitors: payload.visitors,
                totalPrice: payload.totalPrice,
                status: ticket.status,
                issuedAt: payload.issuedAt,
                park: payload.park,
                hasBiometric: ticket.visitors?.some(v => !!v.biometricHash),
            },
        });
    } catch (err) {
        return res.status(500).json({ valid: false, reason: err.message });
    }
}
