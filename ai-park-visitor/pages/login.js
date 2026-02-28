import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { Eye, EyeOff, User, Mail, Lock, Phone, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiLogin, apiRegister } from "../lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState("login");
    const [showPass, setShowPass] = useState(false);
    const [form, setForm] = useState({ name: "", username: "", email: "", password: "", identifier: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const redirectTo = router.query.next || "/profile";

        try {
            if (mode === "register") {
                if (!form.name || !form.username || !form.email || !form.password)
                    return setError("Please fill in all required fields.");
                await apiRegister({
                    name: form.name,
                    username: form.username,
                    email: form.email,
                    password: form.password,
                });
            } else {
                if (!form.identifier || !form.password)
                    return setError("Please fill in all fields.");
                await apiLogin({ identifier: form.identifier, password: form.password });
            }
            router.push(redirectTo);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>{`${mode === "login" ? "Login" : "Register"} | SunnySplash`}</title>
                <meta name="description" content="Login or register at SunnySplash Water Park." />
            </Head>

            <div className="min-h-screen bg-sky-gradient flex items-center justify-center py-16 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-aqua/20 rounded-full blur-3xl" />
                <div className="absolute top-20 right-1/4 text-white/10 text-[200px] select-none leading-none">🌊</div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-sky-gradient p-8 text-center">
                            <div className="text-5xl mb-3">🌊</div>
                            <h1 className="text-3xl font-extrabold text-white font-fun drop-shadow">SunnySplash</h1>
                            <p className="text-white/80 mt-1">Your personal park account</p>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex border-b border-gray-100">
                            {["login", "register"].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => { setMode(m); setError(""); }}
                                    className={`flex-1 py-4 font-bold transition-colors capitalize ${mode === m
                                        ? m === "login" ? "text-sky-blue border-b-2 border-sky-blue" : "text-coral-orange border-b-2 border-coral-orange"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.form
                                key={mode}
                                initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                onSubmit={handleSubmit}
                                className="p-8 space-y-4"
                            >
                                {mode === "register" ? (
                                    <>
                                        <div className="relative">
                                            <User size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                                            <input name="name" required placeholder="Full Name" value={form.name} onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-sky-blue rounded-xl outline-none transition-colors" />
                                        </div>
                                        <div className="relative">
                                            <UserCircle size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                                            <input name="username" required placeholder="Pick a Username" value={form.username} onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-sky-blue rounded-xl outline-none transition-colors" />
                                        </div>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                                            <input name="email" type="email" required placeholder="Email Address" value={form.email} onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-sky-blue rounded-xl outline-none transition-colors" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="relative">
                                        <User size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                                        <input name="identifier" required placeholder="Username or Email" value={form.identifier} onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 focus:border-sky-blue rounded-xl outline-none transition-colors" />
                                    </div>
                                )}

                                <div className="relative">
                                    <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                                    <input name="password" type={showPass ? "text" : "password"} required placeholder="Password" value={form.password} onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border-2 border-gray-100 focus:border-sky-blue rounded-xl outline-none transition-colors" />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-sky-blue">
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                                        ⚠️ {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3.5 rounded-xl font-bold text-lg text-white shadow-md transition-all transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${mode === "login" ? "bg-sky-blue hover:bg-aqua" : "bg-coral-orange hover:bg-orange-500"
                                        }`}
                                >
                                    {loading ? "⏳ Please wait..." : mode === "login" ? "🔑 Sign In" : "🎉 Create Account"}
                                </button>

                                <p className="text-center text-gray-400 text-sm">
                                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                                    <button type="button"
                                        onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                                        className="text-sky-blue font-bold hover:underline">
                                        {mode === "login" ? "Register free" : "Sign in"}
                                    </button>
                                </p>
                            </motion.form>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
