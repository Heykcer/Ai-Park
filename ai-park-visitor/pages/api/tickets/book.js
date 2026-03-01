import dbConnect from '../../../lib/mongodb';
import Ticket from '../../../models/Ticket';
import { verifyToken } from '../../../lib/auth';
import { createHash, createHmac } from 'crypto';

// Secret key for QR token signing. In production use process.env.QR_SECRET
const QR_SECRET = process.env.QR_SECRET || 'sunnysplash-qr-secret-2025';

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
        const { visitors, visitDate, totalPrice, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        if (!visitors || !Array.isArray(visitors) || visitors.length === 0) {
            return res.status(400).json({ message: 'At least one visitor is required' });
        }

        // --- Verify Razorpay Signature ---
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Encode biometric data: hash landmark vector with SHA-256
        const processedVisitors = visitors.map((v) => {
            const visitor = { ...v };
            if (v.landmarkVector && Array.isArray(v.landmarkVector) && v.landmarkVector.length > 0) {
                const vectorString = v.landmarkVector.join(',');
                visitor.biometricHash = createHash('sha256').update(vectorString).digest('hex');
            }
            return visitor;
        });

        const ticket = await Ticket.create({
            user: decoded.id,
            visitors: processedVisitors,
            visitDate,
            totalPrice,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        });

        // --- Generate signed QR token for admin verification ---
        const ticketRef = ticket._id.toString().slice(-6).toUpperCase();
        const qrPayload = {
            ref: ticketRef,
            ticketId: ticket._id.toString(),
            userId: decoded.id,
            visitDate,
            visitors: processedVisitors.length,
            totalPrice,
            park: 'SunnySplash-GEC',
            issuedAt: new Date().toISOString(),
        };

        // HMAC-SHA256 sign the payload so QR tokens cannot be forged
        const payloadStr = JSON.stringify(qrPayload);
        const signature = createHmac('sha256', QR_SECRET).update(payloadStr).digest('hex');
        const qrToken = Buffer.from(JSON.stringify({ payload: qrPayload, sig: signature })).toString('base64');

        // Persist both the token and the readable payload in MongoDB
        await ticket.updateOne({ $set: { qrToken, qrPayload } });

        // Return the token so the frontend can use it for QR rendering
        res.status(201).json({ success: true, ticket: { ...ticket.toObject(), qrToken, qrPayload } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
