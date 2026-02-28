import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    photo: { type: String }, // base64 or URL for face recognition
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
});

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
