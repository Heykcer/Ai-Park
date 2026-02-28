import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Ticket, Users, Star, QrCode, CheckCircle, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FaceCapture from "../components/FaceCapture";
import { apiUploadFace, apiCreateBooking } from "../lib/api";

const ticketTypes = [
    { id: "adult", label: "Adult", emoji: "🧑", price: 49 },
    { id: "child", label: "Child (Under 12)", emoji: "👦", price: 29 },
    { id: "senior", label: "Senior (60+)", emoji: "👴", price: 35 },
];

const membershipOptions = [
    {
        id: "none",
        label: "No Membership",
        desc: "One-day access",
        discount: 0,
        color: "border-gray-200",
        tag: null,
    },
    {
        id: "silver",
        label: "Silver Pass",
        desc: "10% off + priority access",
        discount: 0.1,
        color: "border-sky-blue",
        tag: "Popular",
    },
    {
        id: "gold",
        label: "🌟 Gold Pass",
        desc: "20% off + VIP lounge + free food",
        discount: 0.2,
        color: "border-sunny-yellow",
        tag: "Best Value",
    },
];

export default function BookTickets() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [user, setUser] = useState(null);
    const [date, setDate] = useState("");
    const [quantities, setQuantities] = useState({ adult: 1, child: 0, senior: 0 });
    const [membership, setMembership] = useState("none");
    const [confirmed, setConfirmed] = useState(false);
    const [faceImage, setFaceImage] = useState(null); // base64 face photo
    const [bookingRef, setBookingRef] = useState("");  // from backend
    const [submitting, setSubmitting] = useState(false);
    const [bookError, setBookError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("sp_token");
        if (!token) {
            router.replace("/login?next=/book");
        } else {
            setUser(JSON.parse(localStorage.getItem("sp_user") || "{}"));
            setAuthChecked(true);
        }
    }, [router]);

    // Show nothing while redirecting unauthenticated users
    if (!authChecked) {
        return (
            <div className="min-h-screen bg-sky-gradient flex flex-col items-center justify-center gap-6 text-white">
                <div className="text-7xl animate-bounce-slow">🎟️</div>
                <p className="text-2xl font-bold font-fun">Checking your account...</p>
                <p className="text-white/70">You need to be logged in to book tickets.</p>
                <Link
                    href="/login?next=/book"
                    className="flex items-center gap-2 bg-white text-sky-blue font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                    <LogIn size={20} /> Login / Register
                </Link>
            </div>
        );
    }

    const changeQty = (id, delta) => {
        setQuantities((q) => ({
            ...q,
            [id]: Math.max(0, q[id] + delta),
        }));
    };

    const subtotal = ticketTypes.reduce(
        (sum, t) => sum + t.price * quantities[t.id],
        0
    );
    const discount = membershipOptions.find((m) => m.id === membership)?.discount || 0;
    const total = Math.round(subtotal * (1 - discount));
    const totalVisitors = Object.values(quantities).reduce((a, b) => a + b, 0);

    const handleBook = async (e) => {
        e.preventDefault();
        if (!date || totalVisitors === 0 || !faceImage) return;
        setSubmitting(true);
        setBookError("");

        try {
            // 1. Upload face photo to Cloudinary via FastAPI (Note: locally it saves to MongoDB)
            const { profileImage: savedImage } = await apiUploadFace(faceImage);

            // 2. Create booking in MongoDB
            const res = await apiCreateBooking({
                visit_date: date,
                adult_count: quantities.adult,
                child_count: quantities.child,
                senior_count: quantities.senior,
                membership,
                total_amount: total,
                profileImage: savedImage,
            });

            setBookingRef(res.ticket._id.toString().slice(-6).toUpperCase());
            setConfirmed(true);
        } catch (err) {
            setBookError(err.message || "Booking failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Book Tickets | SunnySplash</title>
                <meta name="description" content="Book your SunnySplash Water Park tickets online." />
            </Head>

            {/* Hero */}
            <section className="bg-sky-gradient py-14 text-center relative overflow-hidden">
                <div className="absolute top-4 left-8 text-white/20 text-7xl select-none">🎟️</div>
                <div className="absolute bottom-4 right-8 text-white/20 text-7xl select-none">☀️</div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-5xl font-extrabold text-white font-fun drop-shadow-lg mb-3">
                        Book Your Tickets 🎟️
                    </h1>
                    <p className="text-white/90 text-xl">Skip the queue — book online and save!</p>
                </motion.div>
            </section>

            <section className="py-16 bg-soft-white min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    <AnimatePresence mode="wait">
                        {confirmed ? (
                            <motion.div
                                key="confirmed"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2rem] soft-shadow p-10 flex flex-col items-center text-center"
                            >
                                <div className="w-24 h-24 bg-fresh-green/20 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle size={48} className="text-fresh-green" />
                                </div>
                                <h2 className="text-3xl font-extrabold font-fun text-fresh-green mb-2">Booking Confirmed! 🎉</h2>
                                <p className="text-gray-500 mb-8 text-lg">Your tickets for <strong>{date}</strong> are ready. Show the QR code at the gate!</p>

                                {/* Mock QR Ticket */}
                                <div className="border-4 border-dashed border-sky-blue rounded-[2rem] p-6 max-w-xs w-full bg-sky-50 relative">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-blue text-white px-4 py-1 rounded-full text-sm font-bold">
                                        🌊 SunnySplash Ticket
                                    </div>
                                    <div className="bg-white rounded-xl p-4 flex items-center justify-center mb-4 shadow-inner">
                                        {faceImage ? (
                                            <img src={faceImage} alt="Face" className="w-28 h-28 rounded-full object-cover border-4 border-sky-blue" />
                                        ) : (
                                            <QrCode size={120} className="text-gray-800" />
                                        )}
                                    </div>
                                    <p className="text-sky-blue font-bold text-lg font-fun">{bookingRef || "SS-PENDING"}</p>
                                    <p className="text-gray-500 text-sm">{totalVisitors} visitor{totalVisitors !== 1 ? "s" : ""} · {date}</p>
                                    <p className="text-coral-orange font-bold text-xl mt-2">${total} paid</p>
                                </div>

                                <button
                                    onClick={() => setConfirmed(false)}
                                    className="mt-8 bg-sky-blue hover:bg-aqua text-white px-8 py-3 rounded-full font-bold transition-colors"
                                >
                                    Book Another Visit
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleBook}
                                className="grid grid-cols-1 lg:grid-cols-5 gap-8"
                            >
                                {/* Left: Form */}
                                <div className="lg:col-span-3 space-y-6">

                                    {/* Date */}
                                    <div className="bg-white p-6 rounded-[1.75rem] soft-shadow">
                                        <h2 className="text-xl font-bold font-poppins text-gray-800 mb-4 flex items-center gap-2">
                                            ☀️ Select Your Visit Date
                                        </h2>
                                        <input
                                            type="date"
                                            required
                                            value={date}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full border-2 border-sky-100 focus:border-sky-blue rounded-xl px-4 py-3 text-gray-700 font-medium outline-none transition-colors text-lg"
                                        />
                                    </div>

                                    {/* Ticket Types */}
                                    <div className="bg-white p-6 rounded-[1.75rem] soft-shadow">
                                        <h2 className="text-xl font-bold font-poppins text-gray-800 mb-4 flex items-center gap-2">
                                            <Users size={20} className="text-sky-blue" /> Choose Visitors
                                        </h2>
                                        <div className="space-y-4">
                                            {ticketTypes.map((t) => (
                                                <div key={t.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                                    <div>
                                                        <p className="font-bold text-gray-800">{t.emoji} {t.label}</p>
                                                        <p className="text-coral-orange font-bold">${t.price}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => changeQty(t.id, -1)}
                                                            className="w-9 h-9 bg-sky-blue/10 hover:bg-sky-blue hover:text-white text-sky-blue rounded-full font-bold text-lg flex items-center justify-center transition-colors"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-gray-800 text-lg">{quantities[t.id]}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => changeQty(t.id, 1)}
                                                            className="w-9 h-9 bg-sky-blue/10 hover:bg-sky-blue hover:text-white text-sky-blue rounded-full font-bold text-lg flex items-center justify-center transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Membership */}
                                    <div className="bg-white p-6 rounded-[1.75rem] soft-shadow">
                                        <h2 className="text-xl font-bold font-poppins text-gray-800 mb-4 flex items-center gap-2">
                                            <Star size={20} className="text-sunny-yellow" /> Membership Upgrade
                                        </h2>
                                        <div className="space-y-3">
                                            {membershipOptions.map((opt) => (
                                                <label
                                                    key={opt.id}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${membership === opt.id ? `${opt.color} bg-sky-50` : "border-gray-100 hover:border-gray-200"
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="membership"
                                                        value={opt.id}
                                                        checked={membership === opt.id}
                                                        onChange={() => setMembership(opt.id)}
                                                        className="accent-sky-blue w-5 h-5"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-800">{opt.label}</p>
                                                        <p className="text-gray-500 text-sm">{opt.desc}</p>
                                                    </div>
                                                    {opt.tag && (
                                                        <span className="bg-sunny-yellow text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">{opt.tag}</span>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Face Recognition */}
                                    <FaceCapture
                                        capturedImage={faceImage}
                                        onCapture={(img) => setFaceImage(img)}
                                        onClear={() => setFaceImage(null)}
                                    />
                                </div>

                                {/* Right: Summary */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-[1.75rem] soft-shadow p-6 sticky top-24">
                                        <h2 className="text-xl font-bold font-poppins text-gray-800 mb-6 flex items-center gap-2">
                                            <Ticket size={20} className="text-coral-orange" /> Order Summary
                                        </h2>

                                        <div className="space-y-3 mb-6">
                                            {ticketTypes.map((t) =>
                                                quantities[t.id] > 0 ? (
                                                    <div key={t.id} className="flex justify-between text-gray-600">
                                                        <span>{t.emoji} {t.label} × {quantities[t.id]}</span>
                                                        <span className="font-semibold">${t.price * quantities[t.id]}</span>
                                                    </div>
                                                ) : null
                                            )}
                                            {totalVisitors === 0 && (
                                                <p className="text-gray-400 text-sm text-center py-4">Add visitors above to get started.</p>
                                            )}
                                        </div>

                                        {discount > 0 && (
                                            <div className="flex justify-between text-fresh-green font-bold mb-3 bg-fresh-green/10 px-3 py-2 rounded-lg">
                                                <span>Membership Discount</span>
                                                <span>−{Math.round(discount * 100)}%</span>
                                            </div>
                                        )}

                                        <div className="border-t-2 border-dashed border-gray-100 pt-4 mb-6">
                                            <div className="flex justify-between text-2xl font-extrabold text-gray-900 font-fun">
                                                <span>Total</span>
                                                <span className="text-coral-orange">${total}</span>
                                            </div>
                                            {date && <p className="text-gray-400 text-sm mt-1">📅 {date}</p>}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!date || totalVisitors === 0 || !faceImage || submitting}
                                            className="w-full bg-coral-orange hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <Ticket size={20} />
                                            {submitting ? "⏳ Processing..." : "Pay & Get Tickets"}
                                        </button>

                                        {bookError && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mt-2">
                                                ⚠️ {bookError}
                                            </div>
                                        )}
                                        {!faceImage && (
                                            <p className="text-center text-amber-500 text-xs mt-2 font-medium">📸 Please capture your face photo to continue</p>
                                        )}
                                        <p className="text-center text-gray-400 text-xs mt-2">🔒 Secure checkout · Instant QR ticket</p>
                                    </div>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </>
    );
}
