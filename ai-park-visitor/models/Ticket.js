import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    photo: { type: String },        // base64 or URL for face photo
    biometricHash: { type: String }, // SHA-256 hash of the face landmark vector
    landmarkVector: { type: [Number] }, // Flat (x,y,z) landmark array for matching
});

const TicketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    visitors: [VisitorSchema],
    bookingDate: {
        type: Date,
        default: Date.now,
    },
    visitDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['booked', 'cancelled', 'completed', 'pending'],
        default: 'booked',
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    qrToken: { type: String },     // HMAC-signed token embedded in QR code
    qrPayload: { type: Object },   // Plain payload for admin display
});

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
