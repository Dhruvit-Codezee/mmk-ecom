"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export default function DashboardPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf7f3] text-[#4b3b2a] text-xl font-medium">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f3] via-[#f6efe7] to-[#efe5d9] px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-[#4b3b2a] mb-12 tracking-wide"
        >
          💎 MMK Admin Dashboard
        </motion.h1>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(`/dashboard/${cat.id}`)}
              className="cursor-pointer bg-white/90 border border-[#d1b892]/50 rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-10 text-center backdrop-blur-sm"
            >
              <div className="text-5xl mb-4">{cat.emoji || "💎"}</div>
              <h2 className="text-xl font-semibold text-[#3b2f2f] tracking-wide mb-2">
                {cat.name}
              </h2>
              <p className="text-sm text-[#7c6f62]">
                {cat.description || `Manage all ${cat.name?.toLowerCase()} products`}
              </p>
              <div className="mt-6">
                <div className="inline-block px-5 py-2 bg-gradient-to-r from-[#b88a44] to-[#e5c17c] text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition">
                  View Products
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#7b6b6b] mt-16">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">MMKJ Admin Panel</span> | Crafted with ✨ by Dhruvit
        </div>
      </div>
    </div>
  );
}
