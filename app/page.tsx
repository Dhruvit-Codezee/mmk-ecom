"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for login state change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ✅ User is logged in → go to dashboard
        router.replace("/dashboard");
      } else {
        // ❌ Not logged in → go to login page
        router.replace("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-600">
        Checking authentication...
      </div>
    );
  }

  return null;
}
