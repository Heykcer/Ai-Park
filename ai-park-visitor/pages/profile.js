import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { User, Ticket, Bell, Users, LogOut, Plus, X, Edit2, CheckCircle, QrCode, Download, ScanFace, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
    apiGetMe,
    apiGetMyBookings,
    apiCancelBooking,
    apiLogout,
} from "../lib/api";

const TABS = [
    { id: "profile", label: "My Profile", emoji: "👤", icon: User },
    { id: "bookings", label: "Bookings", emoji: "🎟️", icon: Ticket },
    { id: "notifications", label: "Notifications", emoji: "🔔", icon: Bell },
    { id: "members", label: "Family Members", emoji: "👨‍👩‍👧", icon: Users },
];

const MOCK_NOTIFICATIONS = [
    { id: 1, text: "New ride 'Galaxy Surge' opening next month! 🚀", time: "Just now", read: false },
    { id: 2, text: "Your booking is confirmed. ✅", time: "2 hours ago", read: false },
    { id: 3, text: "Weekend special: Kids under 5 enter FREE! 🎉", time: "Yesterday", read: true },
    { id: 4, text: "Don't forget to download your QR ticket before visiting.", time: "3 days ago", read: true },
];

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");
    const [members, setMembers] = useState([]);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [addingMember, setAddingMember] = useState(false);
    const [newMember, setNewMember] = useState({ name: "", relation: "", age: "" });
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saved, setSaved] = useState(false);
    const [apiError, setApiError] = useState("");
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [bookingTab, setBookingTab] = useState({});
    const qrRefs = useRef({});

    const downloadQR = (bookingId, ref) => {
        const svg = qrRefs.current[bookingId]?.querySelector("svg");
        if (!svg) return;
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svg);
        const blob = new Blob([svgStr], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SunnySplash-${ref}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const token = localStorage.getItem("sp_token");
        if (!token) {
            router.push("/login");
            return;
        }

        const load = async () => {
            try {
                const [me, myBookings] = await Promise.all([
                    apiGetMe(),
                    apiGetMyBookings(),
                ]);
                setUser(me);
                setEditForm(me);
                setBookings(myBookings);

                // Load local members
                const storedMembers = localStorage.getItem("sp_members");
                if (storedMembers) setMembers(JSON.parse(storedMembers));
            } catch (err) {
                // Token may be expired
                apiLogout();
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [router]);

    const handleLogout = () => {
        apiLogout();
        router.push("/");
    };

    const saveProfile = () => {
        // Profile editing requires a PATCH /auth/me endpoint — update locally for now
        setUser(editForm);
        const stored = JSON.parse(localStorage.getItem("sp_user") || "{}");
        localStorage.setItem("sp_user", JSON.stringify({ ...stored, ...editForm }));
        setEditMode(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleCancelBooking = async (id) => {
        try {
            await apiCancelBooking(id);
            setBookings((bs) =>
                bs.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b))
            );
        } catch (err) {
            setApiError(err.message);
        }
    };

    const addMember = () => {
        if (!newMember.name) return;
        const updated = [...members, { ...newMember, id: Date.now() }];
        setMembers(updated);
        localStorage.setItem("sp_members", JSON.stringify(updated));
        setAddingMember(false);
        setNewMember({ name: "", relation: "", age: "" });
    };

    const removeMember = (id) => {
        const updated = members.filter((m) => m.id !== id);
        setMembers(updated);
        localStorage.setItem("sp_members", JSON.stringify(updated));
    };

    const markRead = (id) => {
        setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-sky-gradient flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🌊</div>
                    <p className="text-xl font-bold font-fun">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <>
            <Head>
                <title>My Profile | SunnySplash</title>
                <meta name="description" content="Manage your SunnySplash account, bookings, and family members." />
            </Head>

            {/* Profile Hero */}
            <section className="bg-sky-gradient py-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-white/30 flex items-center justify-center text-white border-4 border-white shadow-lg overflow-hidden">
                            {user.profileImage
                                ? <img src={user.profileImage} alt="Face" className="w-full h-full object-cover" />
                                : <User size={48} />}
                        </div>
                    </div>
                    <div className="text-center sm:text-left text-white flex-1">
                        <h1 className="text-3xl font-extrabold font-fun drop-shadow">{user.name}</h1>
                        <p className="text-white/80">{user.email}</p>
                        {user.phone && <p className="text-white/70 text-sm">📞 {user.phone}</p>}

                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-full font-bold transition-colors border border-white/30"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </section>

            <section className="py-10 bg-soft-white min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {apiError && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                            ⚠️ {apiError}
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="md:w-56 flex-shrink-0">
                            <div className="bg-white rounded-[1.5rem] soft-shadow p-3 space-y-1">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left relative ${activeTab === tab.id ? "bg-sky-blue text-white shadow-sm" : "text-gray-600 hover:bg-sky-50 hover:text-sky-blue"
                                                }`}
                                        >
                                            <Icon size={18} />
                                            <span>{tab.label}</span>
                                            {tab.id === "notifications" && unreadCount > 0 && (
                                                <span className="ml-auto bg-coral-orange text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <AnimatePresence mode="wait">

                                {/* PROFILE */}
                                {activeTab === "profile" && (
                                    <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                                        <div className="bg-white rounded-[1.75rem] soft-shadow p-8">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-bold font-poppins text-gray-800">👤 My Profile</h2>
                                                <button onClick={() => setEditMode(!editMode)}
                                                    className="flex items-center gap-2 text-sky-blue hover:text-aqua font-bold transition-colors">
                                                    <Edit2 size={16} /> {editMode ? "Cancel" : "Edit"}
                                                </button>
                                            </div>
                                            {saved && (
                                                <div className="flex items-center gap-2 bg-fresh-green/10 text-fresh-green border border-fresh-green/30 px-4 py-3 rounded-xl mb-4 font-medium">
                                                    <CheckCircle size={18} /> Profile saved!
                                                </div>
                                            )}
                                            <div className="space-y-5">
                                                {[
                                                    { label: "Full Name", key: "name", type: "text" },
                                                    { label: "Email Address", key: "email", type: "email" },
                                                    { label: "Phone Number", key: "phone", type: "tel" },
                                                ].map(({ label, key, type }) => (
                                                    <div key={key}>
                                                        <label className="block text-sm font-semibold text-gray-500 mb-1">{label}</label>
                                                        {editMode ? (
                                                            <input type={type} value={editForm[key] || ""}
                                                                onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                                                                className="w-full border-2 border-gray-100 focus:border-sky-blue rounded-xl px-4 py-3 outline-none transition-colors" />
                                                        ) : (
                                                            <p className="text-gray-800 font-medium bg-gray-50 px-4 py-3 rounded-xl">
                                                                {user[key] || <span className="text-gray-400 italic">Not set</span>}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                                {editMode && (
                                                    <button onClick={saveProfile}
                                                        className="bg-sky-blue hover:bg-aqua text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md">
                                                        Save Changes
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "bookings" && (
                                    <motion.div key="bookings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                                        <div className="bg-white rounded-[1.75rem] soft-shadow p-8">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-bold font-poppins text-gray-800">🎟️ My Bookings</h2>
                                                <Link href="/book" className="bg-coral-orange hover:bg-orange-500 text-white px-5 py-2 rounded-full font-bold text-sm transition-colors">
                                                    + Book Now
                                                </Link>
                                            </div>
                                            {bookings.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="text-6xl mb-4">🎟️</div>
                                                    <p className="text-gray-400">No bookings yet. <Link href="/book" className="text-sky-blue font-bold">Book your first visit!</Link></p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {bookings.map((b) => {
                                                        const ref = b._id.toString().slice(-6).toUpperCase();
                                                        const visitDate = new Date(b.visitDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                                                        const isExpanded = expandedBooking === b._id;
                                                        const tab = bookingTab[b._id] || "qr";
                                                        const facePhoto = b.visitors?.[0]?.photo || null;
                                                        const qrValue = b.qrToken || JSON.stringify({ ref, date: visitDate, visitors: b.visitors?.length || 0, amount: b.totalPrice, park: "SunnySplash-GEC" });

                                                        return (
                                                            <div key={b._id} className="border-2 border-dashed border-sky-100 rounded-2xl overflow-hidden transition-all">
                                                                {/* Booking Row */}
                                                                <button
                                                                    onClick={() => setExpandedBooking(isExpanded ? null : b._id)}
                                                                    className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 text-left hover:bg-sky-50/50 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 bg-sky-blue/10 text-sky-blue rounded-xl flex items-center justify-center">
                                                                            <QrCode size={20} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-gray-800">📅 {visitDate}</p>
                                                                            <p className="text-gray-400 text-xs mt-0.5">{b.visitors?.length || 0} visitor(s) · Ref: <span className="font-mono font-bold text-sky-blue">{ref}</span></p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-lg font-extrabold text-coral-orange">₹{b.totalPrice}</span>
                                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === "booked" ? "bg-sky-blue/15 text-sky-blue"
                                                                            : b.status === "cancelled" ? "bg-red-100 text-red-500"
                                                                                : "bg-gray-100 text-gray-500"
                                                                            }`}>
                                                                            {b.status}
                                                                        </span>
                                                                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                                                    </div>
                                                                </button>

                                                                {/* Expanded Ticket */}
                                                                <AnimatePresence>
                                                                    {isExpanded && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="border-t-2 border-dashed border-sky-100 p-5 bg-sky-50/30">
                                                                                {/* Tabs */}
                                                                                <div className="flex gap-2 mb-4 bg-white rounded-xl p-1 shadow-inner max-w-xs">
                                                                                    <button
                                                                                        onClick={() => setBookingTab(t => ({ ...t, [b._id]: "qr" }))}
                                                                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase transition-all ${tab === "qr" ? "bg-sky-blue text-white shadow" : "text-gray-400 hover:text-gray-700"
                                                                                            }`}
                                                                                    >
                                                                                        <QrCode size={13} /> QR Code
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => setBookingTab(t => ({ ...t, [b._id]: "face" }))}
                                                                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase transition-all ${tab === "face" ? "bg-coral-orange text-white shadow" : "text-gray-400 hover:text-gray-700"
                                                                                            }`}
                                                                                    >
                                                                                        <ScanFace size={13} /> Face ID
                                                                                    </button>
                                                                                </div>

                                                                                <AnimatePresence mode="wait">
                                                                                    {tab === "qr" ? (
                                                                                        <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col sm:flex-row items-center gap-6">
                                                                                            <div
                                                                                                ref={el => { if (el) qrRefs.current[b._id] = el; }}
                                                                                                className="bg-white p-4 rounded-2xl shadow-inner border border-sky-100 flex-shrink-0"
                                                                                            >
                                                                                                <QRCodeSVG
                                                                                                    value={qrValue}
                                                                                                    size={150}
                                                                                                    bgColor="#ffffff"
                                                                                                    fgColor="#0369a1"
                                                                                                    level="H"
                                                                                                    includeMargin={false}
                                                                                                />
                                                                                            </div>
                                                                                            <div className="space-y-3">
                                                                                                <p className="text-xs text-gray-400">🔐 This QR code is your backup entry pass. Save it offline!</p>
                                                                                                <div className="text-sm space-y-1 font-medium text-gray-600">
                                                                                                    <p>📅 Visit: <strong>{visitDate}</strong></p>
                                                                                                    <p>👥 Visitors: <strong>{b.visitors?.length || 0}</strong></p>
                                                                                                    <p>💰 Paid: <strong className="text-coral-orange">₹{b.totalPrice}</strong></p>
                                                                                                </div>
                                                                                                <div className="flex flex-wrap gap-2">
                                                                                                    <button
                                                                                                        onClick={() => downloadQR(b._id, ref)}
                                                                                                        className="flex items-center gap-2 bg-sky-blue hover:bg-aqua text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow"
                                                                                                    >
                                                                                                        <Download size={14} /> Save QR
                                                                                                    </button>
                                                                                                    {b.status === "booked" && (
                                                                                                        <button
                                                                                                            onClick={() => handleCancelBooking(b._id)}
                                                                                                            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 px-4 py-2 rounded-full text-xs font-bold transition-all"
                                                                                                        >
                                                                                                            <X size={13} /> Cancel Booking
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </motion.div>
                                                                                    ) : (
                                                                                        <motion.div key="face" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-6">
                                                                                            {facePhoto ? (
                                                                                                <img src={facePhoto} alt="Visitor Face" className="w-28 h-28 rounded-full object-cover border-4 border-coral-orange shadow-lg flex-shrink-0" />
                                                                                            ) : (
                                                                                                <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-300 flex-shrink-0">
                                                                                                    <ScanFace size={36} />
                                                                                                </div>
                                                                                            )}
                                                                                            <div className="text-sm text-gray-500 space-y-1">
                                                                                                <p className="font-bold text-gray-700">Primary Entry: Face Scan</p>
                                                                                                {facePhoto
                                                                                                    ? <p className="text-fresh-green font-medium">✅ Biometric data registered</p>
                                                                                                    : <p className="text-amber-500">⚠️ No face captured — use QR code</p>
                                                                                                }
                                                                                            </div>
                                                                                        </motion.div>
                                                                                    )}
                                                                                </AnimatePresence>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* NOTIFICATIONS */}
                                {activeTab === "notifications" && (
                                    <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                                        <div className="bg-white rounded-[1.75rem] soft-shadow p-8">
                                            <h2 className="text-2xl font-bold font-poppins text-gray-800 mb-6">🔔 Notifications</h2>
                                            <div className="space-y-3">
                                                {notifications.map((n) => (
                                                    <div key={n.id} onClick={() => markRead(n.id)}
                                                        className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-colors ${n.read ? "bg-gray-50" : "bg-sky-50 border border-sky-100"}`}>
                                                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-gray-300" : "bg-sky-blue"}`} />
                                                        <div className="flex-1">
                                                            <p className={`text-sm ${n.read ? "text-gray-500" : "text-gray-800 font-medium"}`}>{n.text}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* MEMBERS */}
                                {activeTab === "members" && (
                                    <motion.div key="members" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                                        <div className="bg-white rounded-[1.75rem] soft-shadow p-8">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-bold font-poppins text-gray-800">👨‍👩‍👧 Family Members</h2>
                                                <button onClick={() => setAddingMember(true)}
                                                    className="flex items-center gap-2 bg-fresh-green hover:bg-green-500 text-white px-5 py-2 rounded-full font-bold text-sm transition-colors">
                                                    <Plus size={16} /> Add Member
                                                </button>
                                            </div>
                                            <AnimatePresence>
                                                {addingMember && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                        <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            <input placeholder="Full Name" value={newMember.name} onChange={(e) => setNewMember((m) => ({ ...m, name: e.target.value }))}
                                                                className="border-2 border-white focus:border-sky-blue rounded-xl px-3 py-2.5 outline-none" />
                                                            <input placeholder="Relation (e.g. Son)" value={newMember.relation} onChange={(e) => setNewMember((m) => ({ ...m, relation: e.target.value }))}
                                                                className="border-2 border-white focus:border-sky-blue rounded-xl px-3 py-2.5 outline-none" />
                                                            <input placeholder="Age" type="number" value={newMember.age} onChange={(e) => setNewMember((m) => ({ ...m, age: e.target.value }))}
                                                                className="border-2 border-white focus:border-sky-blue rounded-xl px-3 py-2.5 outline-none" />
                                                            <div className="sm:col-span-3 flex gap-3">
                                                                <button onClick={addMember} className="bg-sky-blue hover:bg-aqua text-white px-6 py-2 rounded-xl font-bold transition-colors">Save</button>
                                                                <button onClick={() => setAddingMember(false)} className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl font-medium">Cancel</button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            {members.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="text-6xl mb-4">👨‍👩‍👧</div>
                                                    <p className="text-gray-400">No family members added yet.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {members.map((m) => (
                                                        <div key={m.id} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
                                                            <div className="w-12 h-12 bg-sky-blue/10 text-sky-blue rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                                                                {m.name[0]?.toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-bold text-gray-800">{m.name}</p>
                                                                <p className="text-gray-400 text-sm">{m.relation}{m.age && ` · Age ${m.age}`}</p>
                                                            </div>
                                                            <button onClick={() => removeMember(m.id)} className="text-gray-300 hover:text-coral-orange transition-colors">
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
