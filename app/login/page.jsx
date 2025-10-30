"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#f9f6f2] to-[#f3ebe2]">
      <div className="bg-white/90 backdrop-blur-md border border-[#d8c2a6]/40 shadow-xl rounded-2xl p-10 w-[400px]">
        <h2 className="text-2xl font-semibold text-center text-[#3b2f2f] mb-6 tracking-wide">
          💎 Jewelry Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#5a4a4a] mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              className="w-full border border-[#d8c2a6]/60 focus:border-[#c6a76d] focus:ring-1 focus:ring-[#c6a76d] rounded-lg p-2.5 bg-white text-gray-800 outline-none transition"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5a4a4a] mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-[#d8c2a6]/60 focus:border-[#c6a76d] focus:ring-1 focus:ring-[#c6a76d] rounded-lg p-2.5 bg-white text-gray-800 outline-none transition"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#c6a76d] to-[#b18c54] hover:from-[#b18c54] hover:to-[#a07c45] text-white py-2.5 rounded-lg font-medium transition-all duration-300 shadow-md"
          >
            Login
          </button>

          {error && (
            <p className="text-red-500 text-center text-sm mt-2">{error}</p>
          )}
        </form>

        <div className="text-center text-xs text-[#7b6b6b] mt-6">
          © {new Date().getFullYear()} <span className="font-semibold">MMK Admin Panel</span>
        </div>
      </div>
    </div>
  );
}
