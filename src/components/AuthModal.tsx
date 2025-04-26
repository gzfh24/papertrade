"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState(""); // Only for signup
    const [error, setError] = useState("");
    const router = useRouter();

    // Reset form fields when switching tabs or closing
    const resetForm = () => {
        setEmail("");
        setPassword("");
        setUsername("");
        setError("");
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Invalid credentials");
                return;
            }

            console.log("Signin successful:", data.user);
            onClose();
            router.push("/dashboard");
        } catch (err) {
            setError("Something went wrong");
            console.error(err);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, username }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Signup failed");
                return;
            }

            console.log("Signup successful:", data.user);
            onClose();
            router.push("/dashboard");
        } catch (err) {
            setError("Something went wrong");
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                {/* Close Button */}
                <button
                    onClick={() => {
                        resetForm();
                        onClose();
                    }}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                {/* Tabs */}
                <div className="flex border-b mb-4">
                    <button
                        className={`flex-1 py-2 text-center ${
                            activeTab === "signin"
                                ? "border-b-2 border-blue-500 text-blue-500"
                                : "text-gray-500"
                        }`}
                        onClick={() => {
                            setActiveTab("signin");
                            resetForm();
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        className={`flex-1 py-2 text-center ${
                            activeTab === "signup"
                                ? "border-b-2 border-blue-500 text-blue-500"
                                : "text-gray-500"
                        }`}
                        onClick={() => {
                            setActiveTab("signup");
                            resetForm();
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={activeTab === "signin" ? handleSignIn : handleSignUp}>
                    {activeTab === "signup" && (
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                    >
                        {activeTab === "signin" ? "Sign In" : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
}