import Head from "next/head";
import { useState } from "react";
import { MessageSquare, Star, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["Ride Safety", "Staff Behavior", "Cleanliness", "Food Quality", "Long Wait Times", "Other"];

const emojiRatings = [
    { value: 1, emoji: "😞", label: "Terrible" },
    { value: 2, emoji: "😕", label: "Poor" },
    { value: 3, emoji: "😐", label: "Okay" },
    { value: 4, emoji: "😊", label: "Good" },
    { value: 5, emoji: "😃", label: "Amazing!" },
];

export default function Complaints() {
    const [activeTab, setActiveTab] = useState("complaint");
    const [complaintForm, setComplaintForm] = useState({ category: "", title: "", message: "" });
    const [emojiRating, setEmojiRating] = useState(null);
    const [sliderRating, setSliderRating] = useState(5);
    const [starHover, setStarHover] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const handleComplaintChange = (e) =>
        setComplaintForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleComplaintSubmit = (e) => {
        e.preventDefault();
        if (!complaintForm.category || !complaintForm.message) return;
        setSubmitted(true);
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        if (!emojiRating) return;
        setSubmitted(true);
    };

    return (
        <>
            <Head>
                <title>Complaints & Feedback | SunnySplash</title>
                <meta name="description" content="Share your feedback or file a complaint at SunnySplash Water Park." />
            </Head>

            {/* Hero */}
            <section className="bg-sky-gradient py-14 text-center relative overflow-hidden">
                <div className="absolute top-4 left-8 text-white/20 text-7xl select-none">💬</div>
                <div className="absolute bottom-4 right-8 text-white/20 text-7xl select-none">⭐</div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-5xl font-extrabold text-white font-fun drop-shadow-lg mb-3">
                        Feedback & Complaints 💬
                    </h1>
                    <p className="text-white/90 text-xl">Help us make SunnySplash even more amazing!</p>
                </motion.div>
            </section>

            <section className="py-12 bg-soft-white min-h-screen">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2rem] soft-shadow p-12 text-center"
                            >
                                <div className="text-7xl mb-4">🎉</div>
                                <CheckCircle size={52} className="text-fresh-green mx-auto mb-4" />
                                <h2 className="text-3xl font-extrabold font-fun text-fresh-green mb-2">Thank You!</h2>
                                <p className="text-gray-500 text-lg mb-6">Your {activeTab === "complaint" ? "complaint has been logged" : "feedback has been received"}. Our team will review it within 24 hours.</p>
                                <button
                                    onClick={() => { setSubmitted(false); }}
                                    className="bg-sky-blue hover:bg-aqua text-white px-8 py-3 rounded-full font-bold transition-colors"
                                >
                                    Submit Another
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="tabs"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {/* Tab Switcher */}
                                <div className="flex gap-3 mb-8 bg-white p-2 rounded-2xl soft-shadow">
                                    <button
                                        onClick={() => setActiveTab("complaint")}
                                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "complaint" ? "bg-coral-orange text-white shadow-md" : "text-gray-500 hover:text-coral-orange"
                                            }`}
                                    >
                                        <MessageSquare size={18} /> 📝 Raise Complaint
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("feedback")}
                                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "feedback" ? "bg-sunny-yellow text-gray-900 shadow-md" : "text-gray-500 hover:text-amber-600"
                                            }`}
                                    >
                                        <Star size={18} /> ⭐ Rate Experience
                                    </button>
                                </div>

                                {/* Complaint Form */}
                                {activeTab === "complaint" && (
                                    <motion.form
                                        key="complaint"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleComplaintSubmit}
                                        className="bg-white rounded-[2rem] soft-shadow p-8 space-y-6"
                                    >
                                        <h2 className="text-2xl font-bold font-poppins text-gray-800">📝 File a Complaint</h2>

                                        {/* Category */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-3">What is this about? *</label>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map((c) => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setComplaintForm((f) => ({ ...f, category: c }))}
                                                        className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${complaintForm.category === c
                                                                ? "bg-coral-orange text-white border-coral-orange"
                                                                : "border-gray-200 text-gray-600 hover:border-coral-orange hover:text-coral-orange"
                                                            }`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-2">Brief Title</label>
                                            <input
                                                name="title"
                                                value={complaintForm.title}
                                                onChange={handleComplaintChange}
                                                placeholder="e.g. Long queue at Wave Pool"
                                                className="w-full border-2 border-gray-100 focus:border-coral-orange rounded-xl px-4 py-3 outline-none transition-colors"
                                            />
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-2">Full Description *</label>
                                            <textarea
                                                required
                                                name="message"
                                                value={complaintForm.message}
                                                onChange={handleComplaintChange}
                                                rows={5}
                                                placeholder="Please describe your issue in detail..."
                                                className="w-full border-2 border-gray-100 focus:border-coral-orange rounded-xl px-4 py-3 outline-none transition-colors resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-coral-orange hover:bg-orange-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-md"
                                        >
                                            <Send size={20} /> Submit Complaint
                                        </button>
                                    </motion.form>
                                )}

                                {/* Feedback Form */}
                                {activeTab === "feedback" && (
                                    <motion.form
                                        key="feedback"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onSubmit={handleFeedbackSubmit}
                                        className="bg-white rounded-[2rem] soft-shadow p-8 space-y-8"
                                    >
                                        <h2 className="text-2xl font-bold font-poppins text-gray-800">⭐ Rate Your Visit</h2>

                                        {/* Emoji Rating */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-4 text-center">How was your overall experience? *</label>
                                            <div className="flex justify-center gap-4">
                                                {emojiRatings.map((r) => (
                                                    <button
                                                        key={r.value}
                                                        type="button"
                                                        onClick={() => setEmojiRating(r.value)}
                                                        className={`flex flex-col items-center transition-all transform ${emojiRating === r.value ? "scale-125" : "hover:scale-110"
                                                            }`}
                                                    >
                                                        <span className={`text-4xl ${emojiRating === r.value ? "" : "grayscale opacity-60"}`}>
                                                            {r.emoji}
                                                        </span>
                                                        {emojiRating === r.value && (
                                                            <span className="text-xs font-bold text-sunny-yellow mt-1">{r.label}</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Fun Slider */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-4 text-center">
                                                Would you recommend us?{" "}
                                                <span className="text-sky-blue font-extrabold">{sliderRating}/10</span>
                                            </label>
                                            <div className="relative px-2">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    value={sliderRating}
                                                    onChange={(e) => setSliderRating(Number(e.target.value))}
                                                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                                                    style={{
                                                        background: `linear-gradient(to right, #4FC3F7 0%, #4FC3F7 ${(sliderRating - 1) * 11.11}%, #e5e7eb ${(sliderRating - 1) * 11.11}%, #e5e7eb 100%)`,
                                                    }}
                                                />
                                                <div className="flex justify-between text-xs text-gray-400 mt-2 px-0.5">
                                                    <span>1 – No</span>
                                                    <span>5 – Maybe</span>
                                                    <span>10 – Absolutely!</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Comments */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-2">Any comments or suggestions?</label>
                                            <textarea
                                                rows={4}
                                                placeholder="Tell us what you loved or how we can improve..."
                                                className="w-full border-2 border-gray-100 focus:border-sunny-yellow rounded-xl px-4 py-3 outline-none transition-colors resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!emojiRating}
                                            className="w-full bg-sunny-yellow hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-md"
                                        >
                                            <Send size={20} /> Submit Feedback
                                        </button>
                                    </motion.form>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </>
    );
}
