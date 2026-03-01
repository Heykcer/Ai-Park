import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Script from "next/script";
import { Ticket, Users, Star, QrCode, CheckCircle, LogIn, Download, ScanFace } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import FaceCapture from "../components/FaceCapture";
import { apiUploadFace, apiCreateBooking } from "../lib/api";

const ticketTypes = [
    { id: "adult", label: "Adult", emoji: "🧑", price: 1 },
    { id: "child", label: "Child (Under 12)", emoji: "👦", price: 1 },
    { id: "senior", label: "Senior (60+)", emoji: "👴", price: 1 },
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
    const [step, setStep] = useState("selection"); // selection, details, confirmed
    const [currentVisitorIdx, setCurrentVisitorIdx] = useState(0);
    const [visitorsData, setVisitorsData] = useState([]);
    const [tempVisitor, setTempVisitor] = useState({ name: "", age: "", photo: null, faceLandmarks: null });

    const [bookingRef, setBookingRef] = useState("");
    const [qrToken, setQrToken] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [bookError, setBookError] = useState("");
    const [ticketTab, setTicketTab] = useState("qr");
    const qrRef = useRef(null);

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

    const visitorTypesList = [
        ...Array(quantities.adult).fill("adult"),
        ...Array(quantities.child).fill("child"),
        ...Array(quantities.senior).fill("senior")
    ];

    const startDetailsStep = (e) => {
        e.preventDefault();
        if (!date || totalVisitors === 0) return;
        setVisitorsData([]);
        setCurrentVisitorIdx(0);
        setTempVisitor({ name: "", age: "", photo: null, faceLandmarks: null });
        setStep("details");
    };

    const handleNextVisitor = (e) => {
        e.preventDefault();
        if (!tempVisitor.name || !tempVisitor.photo) return;

        const updatedVisitors = [...visitorsData, { ...tempVisitor, type: visitorTypesList[currentVisitorIdx] }];
        setVisitorsData(updatedVisitors);

        if (currentVisitorIdx < totalVisitors - 1) {
            setCurrentVisitorIdx(currentVisitorIdx + 1);
            setTempVisitor({ name: "", age: "", photo: null, faceLandmarks: null });
        } else {
            submitBooking(updatedVisitors);
        }
    };

    const submitBooking = async (finalVisitors) => {
        setSubmitting(true);
        setBookError("");

        try {
            // 1. Create Razorpay Order
            const orderRes = await fetch("/api/razorpay/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: total }),
            });

            if (!orderRes.ok) {
                const err = await orderRes.json();
                throw new Error(err.message || "Failed to initialize payment");
            }

            const order = await orderRes.json();

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "SunnySplash Water Park",
                description: "Ticket Booking",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        setSubmitting(true);
                        // 3. Confirm Booking with Payment Details
                        const res = await apiCreateBooking({
                            visitDate: date,
                            totalPrice: total,
                            visitors: finalVisitors,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        setBookingRef(res.ticket._id.toString().slice(-6).toUpperCase());
                        setQrToken(res.ticket.qrToken || "");
                        setStep("confirmed");
                    } catch (err) {
                        setBookError(err.message || "Booking confirmation failed.");
                    } finally {
                        setSubmitting(false);
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                },
                theme: {
                    color: "#0ea5e9", // sky-blue
                },
                modal: {
                    ondismiss: function () {
                        setSubmitting(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setBookError(err.message || "Booking failed. Please try again.");
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
                        {step === "confirmed" ? (
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
                                <p className="text-gray-500 mb-8 text-lg">Your tickets for <strong>{date}</strong> are ready. Use Face Scan <strong>or</strong> QR Code at the gate!</p>

                                {/* Premium Ticket Card */}
                                <div className="border-4 border-dashed border-sky-blue rounded-[2rem] p-6 max-w-sm w-full bg-sky-50 relative">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-blue text-white px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                                        🌊 SunnySplash Ticket
                                    </div>

                                    {/* Entry Method Tabs */}
                                    <div className="flex gap-2 mb-4 bg-white rounded-xl p-1 shadow-inner">
                                        <button
                                            onClick={() => setTicketTab("qr")}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase transition-all ${ticketTab === "qr" ? "bg-sky-blue text-white shadow-md" : "text-gray-400 hover:text-gray-700"
                                                }`}
                                        >
                                            <QrCode size={14} /> QR Backup
                                        </button>
                                        <button
                                            onClick={() => setTicketTab("face")}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase transition-all ${ticketTab === "face" ? "bg-coral-orange text-white shadow-md" : "text-gray-400 hover:text-gray-700"
                                                }`}
                                        >
                                            <ScanFace size={14} /> Face ID
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <AnimatePresence mode="wait">
                                        {ticketTab === "qr" ? (
                                            <motion.div
                                                key="qr"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="flex flex-col items-center gap-3"
                                            >
                                                <div ref={qrRef} className="bg-white p-4 rounded-2xl shadow-inner border border-sky-100">
                                                    <QRCodeSVG
                                                        value={qrToken || JSON.stringify({ ref: bookingRef || "PENDING", date, visitors: totalVisitors, amount: total, park: "SunnySplash-GEC" })}
                                                        size={180}
                                                        bgColor="#ffffff"
                                                        fgColor="#0369a1"
                                                        level="H"
                                                        includeMargin={false}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium">Show this QR code at the gate as backup</p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const svg = qrRef.current?.querySelector("svg");
                                                        if (!svg) return;
                                                        const serializer = new XMLSerializer();
                                                        const svgStr = serializer.serializeToString(svg);
                                                        const blob = new Blob([svgStr], { type: "image/svg+xml" });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement("a");
                                                        a.href = url;
                                                        a.download = `SunnySplash-${bookingRef || "ticket"}.svg`;
                                                        a.click();
                                                        URL.revokeObjectURL(url);
                                                    }}
                                                    className="flex items-center gap-2 bg-sky-blue hover:bg-aqua text-white px-5 py-2 rounded-full font-bold text-sm transition-all shadow-md"
                                                >
                                                    <Download size={16} /> Save QR Code
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="face"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="flex flex-col items-center gap-3"
                                            >
                                                {visitorsData[0]?.photo ? (
                                                    <img src={visitorsData[0]?.photo} alt="Face" className="w-36 h-36 rounded-full object-cover border-4 border-coral-orange shadow-lg" />
                                                ) : (
                                                    <div className="w-36 h-36 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                                                        <ScanFace size={48} />
                                                    </div>
                                                )}
                                                <p className="text-[10px] text-gray-400 font-medium">Primary: Face will be scanned at entry</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Ticket Info */}
                                    <div className="mt-4 pt-4 border-t border-sky-100 text-center space-y-1">
                                        <p className="text-sky-blue font-bold text-lg font-fun">{bookingRef || "SS-PENDING"}</p>
                                        <p className="text-gray-500 text-sm">{totalVisitors} visitor{totalVisitors !== 1 ? "s" : ""} · {date}</p>
                                        <p className="text-coral-orange font-bold text-xl">₹{total} paid</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep("selection")}
                                    className="mt-8 bg-sky-blue hover:bg-aqua text-white px-8 py-3 rounded-full font-bold transition-colors"
                                >
                                    Book Another Visit
                                </button>
                            </motion.div>
                        ) : step === "selection" ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={startDetailsStep}
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
                                                        <p className="text-coral-orange font-bold">₹{t.price}</p>
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

                                    {/* Face Recognition (Removed from here, moved to step 2) */}
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
                                                        <span className="font-semibold">₹{t.price * quantities[t.id]}</span>
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
                                                <span className="text-coral-orange">₹{total}</span>
                                            </div>
                                            {date && <p className="text-gray-400 text-sm mt-1">📅 {date}</p>}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!date || totalVisitors === 0 || submitting}
                                            className="w-full bg-coral-orange hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <Ticket size={20} />
                                            {submitting ? "⏳ Processing..." : "Provide Visitor Details →"}
                                        </button>

                                        {bookError && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mt-2">
                                                ⚠️ {bookError}
                                            </div>
                                        )}
                                        <p className="text-center text-gray-400 text-xs mt-2">🔒 Secure checkout · Instant QR ticket</p>
                                    </div>
                                </div>
                            </motion.form>
                        ) : (
                            /* Step 2: Visitor Details */
                            <motion.form
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onSubmit={handleNextVisitor}
                                className="max-w-3xl mx-auto w-full"
                            >
                                <div className="bg-white rounded-[2rem] soft-shadow p-8 sm:p-10 border-t-8 border-sky-blue">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h2 className="text-3xl font-extrabold font-fun text-gray-800">
                                                Visitor {currentVisitorIdx + 1} of {totalVisitors}
                                            </h2>
                                            <p className="text-gray-500 font-medium">Type: <span className="text-sky-blue uppercase font-bold">{visitorTypesList[currentVisitorIdx]}</span></p>
                                        </div>
                                        <div className="bg-sky-50 px-4 py-2 rounded-2xl border border-sky-100">
                                            <p className="text-sky-blue font-bold text-sm">Step 2 of 2</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter visitor name"
                                                    value={tempVisitor.name}
                                                    onChange={(e) => setTempVisitor({ ...tempVisitor, name: e.target.value })}
                                                    className="w-full border-2 border-gray-100 focus:border-sky-blue rounded-2xl px-5 py-4 text-gray-700 font-medium outline-none transition-all text-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Age (Years)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    placeholder="e.g. 25"
                                                    value={tempVisitor.age}
                                                    onChange={(e) => setTempVisitor({ ...tempVisitor, age: e.target.value })}
                                                    className="w-full border-2 border-gray-100 focus:border-sky-blue rounded-2xl px-5 py-4 text-gray-700 font-medium outline-none transition-all text-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <label className="block text-sm font-bold text-gray-600 mb-4 uppercase tracking-wider self-start">Face Capture</label>
                                            <FaceCapture
                                                capturedImage={tempVisitor.photo}
                                                onCapture={(img) => setTempVisitor(prev => ({ ...prev, photo: img }))}
                                                onCaptureLandmarks={(lm) => setTempVisitor(prev => ({ ...prev, faceLandmarks: lm }))}
                                                onClear={() => setTempVisitor(prev => ({ ...prev, photo: null, faceLandmarks: null }))}
                                            />
                                            {!tempVisitor.photo && (
                                                <p className="text-amber-500 text-xs mt-4 font-bold animate-pulse">📸 Look at the camera to capture</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep("selection")}
                                            className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-500 py-4 rounded-2xl font-bold transition-all"
                                        >
                                            ← Back to Quantities
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!tempVisitor.name || !tempVisitor.photo || submitting}
                                            className="flex-[2] bg-fresh-green hover:bg-green-500 disabled:opacity-40 text-white py-4 rounded-2xl font-bold text-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                                        >
                                            {submitting ? (
                                                <>⏳ Processing...</>
                                            ) : (
                                                <>
                                                    {currentVisitorIdx === totalVisitors - 1 ? "Complete Booking 🎟️" : "Next Visitor →"}
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {bookError && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mt-6">
                                            ⚠️ {bookError}
                                        </div>
                                    )}
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Razorpay Checkout Script */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </>
    );
}
