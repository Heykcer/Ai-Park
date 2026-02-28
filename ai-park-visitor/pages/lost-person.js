import Head from "next/head";
import { useState } from "react";
import { Upload, User, MapPin, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const locations = [
    "Wave Pool Area",
    "Roller Coaster Zone",
    "Kids Kingdom",
    "Lazy River",
    "Food Court",
    "Extreme Slides Area",
    "Main Entrance / Exit",
    "Restrooms Block A",
    "Restrooms Block B",
    "Parking Lot",
    "Other / Unknown",
];

export default function LostPerson() {
    const [submitted, setSubmitted] = useState(false);
    const [photoName, setPhotoName] = useState("");
    const [form, setForm] = useState({ name: "", age: "", location: "", description: "" });

    const handlePhoto = (e) => {
        if (e.target.files[0]) setPhotoName(e.target.files[0].name);
    };

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.location) return;
        setSubmitted(true);
    };

    return (
        <>
            <Head>
                <title>Report Lost Person | SunnySplash</title>
                <meta name="description" content="Report a lost or missing person at SunnySplash Water Park." />
            </Head>

            {/* Hero */}
            <section className="bg-sky-gradient py-14 text-center relative overflow-hidden">
                <div className="absolute top-6 left-8 text-white/20 text-7xl select-none">🔍</div>
                <div className="absolute bottom-4 right-8 text-white/20 text-7xl select-none">👨‍👩‍👧</div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-5xl font-extrabold text-white font-fun drop-shadow-lg mb-3">
                        Report a Lost Person 🔍
                    </h1>
                    <p className="text-white/90 text-xl max-w-xl mx-auto">
                        Our security team will be alerted immediately and begin searching.
                    </p>
                </motion.div>
            </section>

            <section className="py-14 bg-soft-white min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* Illustration Panel */}
                        <div className="lg:w-64 flex-shrink-0">
                            <div className="bg-white rounded-[1.75rem] soft-shadow p-6 text-center">
                                <div className="text-7xl mb-4">🕵️</div>
                                <h3 className="font-bold text-gray-800 font-poppins mb-2">Our Team Is Ready</h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    Once you submit, our security and stewards will begin looking immediately. Average response time: <strong className="text-sky-blue">under 3 minutes.</strong>
                                </p>
                                <div className="space-y-2 text-sm text-gray-600 text-left">
                                    <p>📍 Check-in at Medical Post</p>
                                    <p>📢 Announcements every 2 min</p>
                                    <p>📷 CCTV monitoring all zones</p>
                                    <p>🤝 100% of cases resolved</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="flex-1">
                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white rounded-[1.75rem] soft-shadow p-10 text-center"
                                    >
                                        <div className="text-7xl mb-4">✅</div>
                                        <CheckCircle size={56} className="text-fresh-green mx-auto mb-4" />
                                        <h2 className="text-3xl font-extrabold font-fun text-fresh-green mb-2">Report Submitted!</h2>
                                        <p className="text-gray-500 text-lg mb-2">
                                            Our security team has been alerted about <strong>{form.name}</strong>.
                                        </p>
                                        <p className="text-gray-500 mb-6">Please go to the <strong>Main Medical Post</strong> near the Central Fountain. A team member will assist you.</p>
                                        <div className="bg-sky-50 border-2 border-sky-blue/30 rounded-xl p-4 font-bold text-sky-blue text-lg mb-6">
                                            📞 Emergency Line: +1 (800) 911-PARK
                                        </div>
                                        <button
                                            onClick={() => { setSubmitted(false); setForm({ name: "", age: "", location: "", description: "" }); setPhotoName(""); }}
                                            className="bg-sky-blue hover:bg-aqua text-white px-8 py-3 rounded-full font-bold transition-colors"
                                        >
                                            Submit Another Report
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onSubmit={handleSubmit}
                                        className="bg-white rounded-[1.75rem] soft-shadow p-8 space-y-6"
                                    >
                                        <h2 className="text-2xl font-bold font-poppins text-gray-800">Lost Person Details</h2>

                                        {/* Photo Upload */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-2">📷 Upload Photo (optional)</label>
                                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-sky-blue/40 hover:border-sky-blue bg-sky-50 hover:bg-sky-100 rounded-2xl p-8 cursor-pointer transition-colors">
                                                <Upload size={32} className="text-sky-blue mb-2" />
                                                <span className="text-sky-blue font-medium">
                                                    {photoName || "Click to upload or drag a photo here"}
                                                </span>
                                                <span className="text-gray-400 text-sm mt-1">JPG, PNG supported</span>
                                                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                                            </label>
                                        </div>

                                        {/* Name & Age Row */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block font-semibold text-gray-700 mb-2">
                                                    <User size={16} className="inline mr-1 text-sky-blue" /> Name *
                                                </label>
                                                <input
                                                    required
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Emma Johnson"
                                                    className="w-full border-2 border-gray-100 focus:border-sky-blue rounded-xl px-4 py-3 outline-none transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-semibold text-gray-700 mb-2">Age</label>
                                                <input
                                                    name="age"
                                                    type="number"
                                                    value={form.age}
                                                    onChange={handleChange}
                                                    placeholder="e.g. 7"
                                                    min="1"
                                                    className="w-full border-2 border-gray-100 focus:border-sky-blue rounded-xl px-4 py-3 outline-none transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Last Seen */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-2">
                                                <MapPin size={16} className="inline mr-1 text-coral-orange" /> Last Seen Location *
                                            </label>
                                            <select
                                                required
                                                name="location"
                                                value={form.location}
                                                onChange={handleChange}
                                                className="w-full border-2 border-gray-100 focus:border-sky-blue rounded-xl px-4 py-3 outline-none transition-colors bg-white"
                                            >
                                                <option value="">Select a location...</option>
                                                {locations.map((l) => (
                                                    <option key={l} value={l}>{l}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-2">Clothing / Description</label>
                                            <textarea
                                                name="description"
                                                value={form.description}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder="e.g. wearing a red swimsuit, brown hair, carrying a yellow floatie..."
                                                className="w-full border-2 border-gray-100 focus:border-sky-blue rounded-xl px-4 py-3 outline-none transition-colors resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-coral-orange hover:bg-orange-500 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                        >
                                            🚨 Submit Emergency Report
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
